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
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please provide a valid phone number']
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
  weightLevel: {
    type: String,
    enum: ['underweight', 'normal', 'overweight', 'obese'],
    default: 'normal'
  },
  goal: {
    type: String,
    enum: ['lose', 'maintain', 'gain'],
    default: 'maintain'
  },
  activityLevel: {
    type: String,
    enum: ['no_activity', 'sedentary', 'light_moderate', 'moderate', 'active', 'athlete'],
    default: 'moderate'
  },
  macroRatio: {
    protein: {
      type: Number,
      min: [0, 'Protein percentage must be at least 0'],
      max: [100, 'Protein percentage cannot exceed 100'],
      default: 30
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs percentage must be at least 0'],
      max: [100, 'Carbs percentage cannot exceed 100'],
      default: 40
    },
    fats: {
      type: Number,
      min: [0, 'Fats percentage must be at least 0'],
      max: [100, 'Fats percentage cannot exceed 100'],
      default: 30
    }
  },
  bmi: {
    type: Number,
    default: null
  },
  bmr: {
    type: Number,
    default: null
  },
  tdee: {
    type: Number,
    default: null
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

// Calculate BMI before saving if height or weight changed
userSchema.pre('save', function(next) {
  if (this.isModified('height') || this.isModified('weight')) {
    this.calculateBMI();
  }
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate BMI
userSchema.methods.calculateBMI = function() {
  if (!this.height || !this.weight) {
    this.bmi = null;
    return null;
  }
  
  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = this.height / 100;
  this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  
  // Determine weight level based on BMI
  if (this.bmi < 18.5) {
    this.weightLevel = 'underweight';
  } else if (this.bmi < 25) {
    this.weightLevel = 'normal';
  } else if (this.bmi < 30) {
    this.weightLevel = 'overweight';
  } else {
    this.weightLevel = 'obese';
  }
  
  return this.bmi;
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
    no_activity: 1.2,
    sedentary: 1.2,
    light_moderate: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9
  };
  
  // Goal adjustments
  const goalMultipliers = {
    lose: 0.85,  // 15% calorie deficit
    maintain: 1,
    gain: 1.15   // 15% calorie surplus
  };
  
  const tdee = bmr * (activityMultipliers[this.activityLevel] || 1.55);
  const dailyCalories = Math.round(tdee * (goalMultipliers[this.goal] || 1));
  
  // Store BMR and TDEE values
  this.bmr = Math.round(bmr);
  this.tdee = Math.round(tdee);
  
  // Use custom macro ratios if provided, otherwise use defaults
  const proteinPct = (this.macroRatio?.protein || 30) / 100;
  const carbsPct = (this.macroRatio?.carbs || 40) / 100;
  const fatsPct = (this.macroRatio?.fats || 30) / 100;
  
  // Set macronutrient goals based on user's macro ratio preferences
  this.dailyCalorieGoal = dailyCalories;
  this.dailyProteinGoal = Math.round((dailyCalories * proteinPct) / 4); // 4 cal/g protein
  this.dailyCarbsGoal = Math.round((dailyCalories * carbsPct) / 4);   // 4 cal/g carbs
  this.dailyFatGoal = Math.round((dailyCalories * fatsPct) / 9);      // 9 cal/g fat
  
  return dailyCalories;
};

module.exports = mongoose.model('User', userSchema);
