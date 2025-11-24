const Admin = require('../models/Admin');
const User = require('../models/User');
const MealPlan = require('../models/Meal');
const ErrorResponse = require('../utils/errorResponse');
const generateToken = require('../utils/generateToken');

const formatAdminPayload = (admin) => ({
    id: admin._id,
    name: admin.name || 'Administrator',
    email: admin.email,
    role: admin.role || 'super',
    lastLogin: admin.lastLogin,
    createdAt: admin.createdAt
});

const sendAdminTokenResponse = (admin, statusCode, res) => {
    const token = generateToken(admin._id);

    res.status(statusCode).json({
        success: true,
        token,
        data: formatAdminPayload(admin)
    });
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and password', 400));
        }

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        admin.lastLogin = new Date();
        await admin.save({ validateBeforeSave: false });

        sendAdminTokenResponse(admin, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);
        const last30Days = new Date(now);
        last30Days.setDate(now.getDate() - 30);

        const [
            totalUsers,
            newUsersThisWeek,
            mealPlansThisWeek,
            completedPlansThisWeek,
            distinctActiveUsers,
            usersByGoal,
            usersByGender,
            activityLevels,
            dietaryPreferences,
            recentUsers,
            growthTrend
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: last7Days } }),
            MealPlan.countDocuments({ createdAt: { $gte: last7Days } }),
            MealPlan.countDocuments({ isCompleted: true, updatedAt: { $gte: last7Days } }),
            MealPlan.aggregate([
                { $match: { updatedAt: { $gte: last30Days } } },
                { $group: { _id: '$userId' } },
                { $count: 'activeUsers' }
            ]),
            User.aggregate([{ $group: { _id: '$goal', count: { $sum: 1 } } }]),
            User.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),
            User.aggregate([{ $group: { _id: '$activityLevel', count: { $sum: 1 } } }]),
            User.aggregate([
                {
                    $project: {
                        restriction: {
                            $cond: [
                                { $gt: [{ $size: { $ifNull: ['$preferences.dietaryRestrictions', []] } }, 0] },
                                { $arrayElemAt: ['$preferences.dietaryRestrictions', 0] },
                                'none'
                            ]
                        }
                    }
                },
                { $group: { _id: '$restriction', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            User.find()
                .sort({ createdAt: -1 })
                .limit(6)
                .select('name email goal activityLevel status createdAt preferences.dietaryRestrictions'),
            User.aggregate([
                { $match: { createdAt: { $gte: last30Days } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const activeUsersLast30 = distinctActiveUsers[0]?.activeUsers || 0;
        const planCompletionRate = mealPlansThisWeek === 0
            ? 0
            : Math.round((completedPlansThisWeek / mealPlansThisWeek) * 100);

        const alerts = [];
        if (planCompletionRate < 55) {
            alerts.push({
                severity: 'error',
                title: 'Meal completion is low',
                description: 'Users completed less than 55% of the generated plans this week.'
            });
        }
        if (newUsersThisWeek < 5) {
            alerts.push({
                severity: 'warning',
                title: 'Low acquisition',
                description: 'New sign-ups dipped below 5 this week. Consider a marketing push.'
            });
        }
        if (activeUsersLast30 / (totalUsers || 1) < 0.3) {
            alerts.push({
                severity: 'info',
                title: 'Engagement opportunity',
                description: 'Less than 30% of users had activity in the last month.'
            });
        }

        const systemHealth = [
            {
                label: 'API Health',
                status: 'operational',
                detail: 'No downtime reported in last 24h'
            },
            {
                label: 'Meal Generator',
                status: planCompletionRate > 60 ? 'operational' : 'degraded',
                detail: planCompletionRate > 60 ? 'Healthy throughput' : 'Monitor completion rate closely'
            },
            {
                label: 'Notifications',
                status: 'operational',
                detail: 'Reminder queues under 1s'
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    totalUsers,
                    newUsersThisWeek,
                    activeUsersLast30,
                    mealPlansThisWeek
                },
                planCompletionRate,
                usersByGoal,
                usersByGender,
                activityLevels,
                dietaryPreferences,
                recentUsers,
                userGrowth: growthTrend.map(item => ({
                    date: item._id,
                    count: item.count
                })),
                alerts,
                systemHealth
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .sort('-createdAt')
            .select('name email goal activityLevel status createdAt lastLogin preferences');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user's status (activate/suspend)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/SuperAdmin
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['active', 'suspended'];

        if (!validStatuses.includes(status)) {
            return next(new ErrorResponse('Invalid status value', 400));
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).select('name email goal status activityLevel createdAt');

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};
