const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  age: {
    type: Number,
    min: [13, 'You must be at least 13 years old'],
    max: [120, 'Please enter a valid age']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  height: {
    type: Number,
    min: [100, 'Height must be at least 100cm'],
    max: [300, 'Height cannot exceed 300cm']
  },
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20kg'],
    max: [300, 'Weight cannot exceed 300kg']
  },
  goal: {
    type: String,
    enum: ['lose', 'maintain', 'gain'],
    default: 'maintain'
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  preferences: {
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'none'],
      default: ['none']
    }],
    allergies: [String],
    dislikedFoods: [String],
    preferredCuisines: [String]
  },
  dailyCalorieGoal: Number,
  dailyProteinGoal: Number,
  dailyCarbsGoal: Number,
  dailyFatGoal: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate daily calorie needs based on user data
userSchema.methods.calculateDailyCalories = function() {
  // Basic BMR calculation using Mifflin-St Jeor Equation
  let bmr;
  
  if (this.gender === 'male') {
    bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
  } else {
    bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
  }
  
  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  // Goal adjustments
  const goalMultipliers = {
    lose: 0.85,  // 15% calorie deficit
    maintain: 1,
    gain: 1.15   // 15% calorie surplus
  };
  
  const tdee = bmr * (activityMultipliers[this.activityLevel] || 1.55);
  const dailyCalories = Math.round(tdee * (goalMultipliers[this.goal] || 1));
  
  // Set macronutrient goals (40% carbs, 30% protein, 30% fat as default)
  this.dailyCalorieGoal = dailyCalories;
  this.dailyProteinGoal = Math.round((dailyCalories * 0.3) / 4); // 4 cal/g protein
  this.dailyCarbsGoal = Math.round((dailyCalories * 0.4) / 4);   // 4 cal/g carbs
  this.dailyFatGoal = Math.round((dailyCalories * 0.3) / 9);      // 9 cal/g fat
  
  return dailyCalories;
};

module.exports = mongoose.model('User', userSchema);
