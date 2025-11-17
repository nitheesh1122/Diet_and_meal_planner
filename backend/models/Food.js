const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a food name'],
    trim: true,
    maxlength: [100, 'Food name cannot be more than 100 characters']
  },
  servingSize: {
    amount: {
      type: Number,
      required: [true, 'Please provide a serving size amount'],
      min: [0, 'Serving size must be a positive number']
    },
    unit: {
      type: String,
      required: [true, 'Please provide a serving size unit'],
      enum: ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'slice', 'small', 'medium', 'large']
    }
  },
  calories: {
    type: Number,
    required: [true, 'Please provide calorie information'],
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    required: [true, 'Please provide protein information'],
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: [true, 'Please provide carbs information'],
    min: [0, 'Carbs cannot be negative']
  },
  fat: {
    type: Number,
    required: [true, 'Please provide fat information'],
    min: [0, 'Fat cannot be negative']
  },
  fiber: {
    type: Number,
    default: 0,
    min: [0, 'Fiber cannot be negative']
  },
  sugar: {
    type: Number,
    default: 0,
    min: [0, 'Sugar cannot be negative']
  },
  sodium: {
    type: Number,
    default: 0,
    min: [0, 'Sodium cannot be negative']
  },
  category: {
    type: String,
    enum: [
      'dairy', 'protein', 'grains', 'fruits', 'vegetables', 
      'fats', 'sweets', 'beverages', 'other'
    ],
    default: 'other'
  },
  dietaryType: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan'],
    default: 'vegetarian',
    index: true
  },
  source: {
    type: String, // filename or dataset key
    index: true,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', null],
    index: true,
    default: null
  },
  goal: {
    type: String,
    enum: ['lose', 'maintain', 'gain', null],
    index: true,
    default: null
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  ingredients: [{
    name: String,
    amount: Number,
    unit: String,
    category: String
  }],
  preparation: String,
  recipe: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for text search
foodSchema.index({ name: 'text', category: 'text' });
// Useful composite indexes for lookups/upserts
foodSchema.index({ name: 1, mealType: 1 }, { unique: false });
foodSchema.index({ name: 1, mealType: 1, goal: 1 }, { unique: false });

// Virtual for formatted serving size
foodSchema.virtual('formattedServingSize').get(function() {
  return `${this.servingSize.amount} ${this.servingSize.unit}`;
});

// Static method to search foods
foodSchema.statics.search = async function(query) {
  return await this.find({
    $text: { $search: query },
    isVerified: true
  })
  .limit(20)
  .select('name calories protein carbs fat servingSize category');
};

// Pre-save hook to ensure consistent formatting
foodSchema.pre('save', function(next) {
  // Trim and lowercase name
  this.name = this.name.trim();
  
  // Ensure category is lowercase
  if (this.category) {
    this.category = this.category.toLowerCase();
  }
  
  next();
});

module.exports = mongoose.model('Food', foodSchema);
