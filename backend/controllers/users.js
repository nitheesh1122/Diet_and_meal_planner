const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (owner)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure requester is the same user
    if (!req.user || req.user._id.toString() !== id) {
      return next(new ErrorResponse('Not authorized to access this user', 403));
    }

    const user = await User.findById(id);
    if (!user) return next(new ErrorResponse('User not found', 404));

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user by ID
// @route   PUT /api/users/:id
// @access  Private (owner)
const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user._id.toString() !== id) {
      return next(new ErrorResponse('Not authorized to update this user', 403));
    }

    const allowed = ['name', 'email', 'age', 'gender', 'height', 'weight', 'goal', 'activityLevel', 'preferences'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const user = await User.findById(id);
    if (!user) return next(new ErrorResponse('User not found', 404));

    Object.assign(user, updates);
    // Recalculate calorie goals if relevant fields changed
    if ('age' in updates || 'gender' in updates || 'height' in updates || 'weight' in updates || 'goal' in updates || 'activityLevel' in updates) {
      user.calculateDailyCalories();
    }

    const saved = await user.save();
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserById, updateUserById };
