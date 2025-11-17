const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      age, 
      phoneNumber,
      gender, 
      height, 
      weight, 
      weightLevel,
      goal, 
      activityLevel, 
      dietaryRestrictions,
      macroRatio
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      age,
      phoneNumber,
      gender,
      height,
      weight,
      weightLevel,
      goal,
      activityLevel,
      macroRatio: macroRatio || {
        protein: 30,
        carbs: 40,
        fats: 30
      },
      preferences: {
        dietaryRestrictions: dietaryRestrictions || ['none']
      }
    });

    // Calculate BMI and daily calorie needs
    user.calculateBMI();
    user.calculateDailyCalories();
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, age, gender, height, weight, phoneNumber, macroRatio } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.height = height || user.height;
    user.weight = weight || user.weight;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    if (macroRatio) {
      user.macroRatio = {
        protein: typeof macroRatio.protein === 'number' ? macroRatio.protein : user.macroRatio?.protein,
        carbs: typeof macroRatio.carbs === 'number' ? macroRatio.carbs : user.macroRatio?.carbs,
        fats: typeof macroRatio.fats === 'number' ? macroRatio.fats : user.macroRatio?.fats
      };
    }
    
    // Recalculate calories if weight, height, age, or gender changed
    if (weight || height || age || gender || macroRatio) {
      user.calculateDailyCalories();
    }
    if (weight || height) {
      user.calculateBMI();
    }
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user goals
// @route   PUT /api/auth/goals
// @access  Private
const updateUserGoals = async (req, res, next) => {
  try {
    const { goal, activityLevel } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Update fields
    user.goal = goal || user.goal;
    user.activityLevel = activityLevel || user.activityLevel;
    
    // Recalculate calories if goal or activity level changed
    user.calculateDailyCalories();
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updateUserPreferences = async (req, res, next) => {
  try {
    const { dietaryRestrictions, allergies, dislikedFoods, preferredCuisines } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Update preferences
    user.preferences = {
      dietaryRestrictions: dietaryRestrictions || user.preferences.dietaryRestrictions,
      allergies: allergies || user.preferences.allergies,
      dislikedFoods: dislikedFoods || user.preferences.dislikedFoods,
      preferredCuisines: preferredCuisines || user.preferences.preferredCuisines
    };
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to send token response (JSON only, no cookies)
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: user
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  updateUserGoals,
  updateUserPreferences
};
