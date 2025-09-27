const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: [true, 'Please provide a food reference']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide a quantity'],
    min: [0.1, 'Quantity must be at least 0.1']
  },
  servingSize: {
    amount: Number,
    unit: String
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fat: {
    type: Number,
    required: true,
    min: 0
  }
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  meals: {
    breakfast: [mealItemSchema],
    lunch: [mealItemSchema],
    dinner: [mealItemSchema],
    snacks: [mealItemSchema]
  },
  totalCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  totalProtein: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCarbs: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFat: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be longer than 500 characters']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
mealPlanSchema.pre('save', function(next) {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  
  // Reset totals
  this.totalCalories = 0;
  this.totalProtein = 0;
  this.totalCarbs = 0;
  this.totalFat = 0;
  
  // Calculate totals for each meal type
  mealTypes.forEach(mealType => {
    if (this.meals[mealType] && this.meals[mealType].length > 0) {
      this.meals[mealType].forEach(item => {
        this.totalCalories += item.calories * item.quantity;
        this.totalProtein += item.protein * item.quantity;
        this.totalCarbs += item.carbs * item.quantity;
        this.totalFat += item.fat * item.quantity;
      });
    }
  });
  
  // Round to 2 decimal places
  this.totalCalories = Math.round(this.totalCalories * 100) / 100;
  this.totalProtein = Math.round(this.totalProtein * 100) / 100;
  this.totalCarbs = Math.round(this.totalCarbs * 100) / 100;
  this.totalFat = Math.round(this.totalFat * 100) / 100;
  
  next();
});

// Create a compound index for user and date
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Static method to get or create a meal plan for a user and date
mealPlanSchema.statics.getOrCreate = async function(userId, date) {
  // Normalize date to start of day for consistent comparison
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  let mealPlan = await this.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  if (!mealPlan) {
    mealPlan = await this.create({
      userId,
      date: startOfDay,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    });
  }
  
  return mealPlan;
};

module.exports = mongoose.model('MealPlan', mealPlanSchema);
