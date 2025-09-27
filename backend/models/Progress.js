const mongoose = require('mongoose');

const progressEntrySchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [20, 'Weight must be at least 20kg'],
    max: [300, 'Weight cannot exceed 300kg']
  },
  bodyFat: {
    type: Number,
    min: [3, 'Body fat percentage is too low'],
    max: [60, 'Body fat percentage is too high']
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    thighs: Number,
    // Add other measurements as needed
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be longer than 500 characters']
  },
  photo: String, // URL to stored photo
  date: {
    type: Date,
    default: Date.now
  }
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  entries: [progressEntrySchema],
  startingWeight: {
    weight: Number,
    date: Date
  },
  goalWeight: {
    weight: Number,
    targetDate: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for current weight (most recent entry)
progressSchema.virtual('currentWeight').get(function() {
  if (this.entries && this.entries.length > 0) {
    // Sort entries by date in descending order and get the most recent
    const sortedEntries = [...this.entries].sort((a, b) => b.date - a.date);
    return {
      weight: sortedEntries[0].weight,
      date: sortedEntries[0].date
    };
  }
  return null;
});

// Virtual for weight change from starting weight
progressSchema.virtual('weightChange').get(function() {
  if (!this.startingWeight || !this.startingWeight.weight || !this.currentWeight) {
    return null;
  }
  
  const change = this.currentWeight.weight - this.startingWeight.weight;
  const percentage = (change / this.startingWeight.weight) * 100;
  
  return {
    amount: change,
    percentage: parseFloat(percentage.toFixed(2)),
    isGain: change > 0,
    isLoss: change < 0,
    isMaintained: change === 0
  };
});

// Virtual for progress towards goal weight
progressSchema.virtual('goalProgress').get(function() {
  if (!this.startingWeight || !this.startingWeight.weight || 
      !this.goalWeight || !this.goalWeight.weight || !this.currentWeight) {
    return null;
  }
  
  const totalChangeNeeded = this.goalWeight.weight - this.startingWeight.weight;
  const currentChange = this.currentWeight.weight - this.startingWeight.weight;
  
  // Calculate percentage of goal achieved (0 to 1)
  let percentage = 0;
  if (totalChangeNeeded !== 0) {
    percentage = Math.min(Math.max(currentChange / totalChangeNeeded, 0), 1);
  } else {
    percentage = 1; // Already at goal
  }
  
  return {
    percentage: parseFloat((percentage * 100).toFixed(1)),
    remaining: this.goalWeight.weight - this.currentWeight.weight,
    isOnTrack: this.isOnTrack()
  };
});

// Method to check if user is on track to reach their goal
progressSchema.methods.isOnTrack = function() {
  if (!this.startingWeight || !this.goalWeight || !this.goalWeight.targetDate || !this.entries || this.entries.length < 2) {
    return null;
  }
  
  const sortedEntries = [...this.entries].sort((a, b) => a.date - b.date);
  const firstEntry = sortedEntries[0];
  const lastEntry = sortedEntries[sortedEntries.length - 1];
  
  const totalDays = Math.ceil((this.goalWeight.targetDate - this.startingWeight.date) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((lastEntry.date - firstEntry.date) / (1000 * 60 * 60 * 24));
  
  if (daysElapsed <= 0 || totalDays <= 0) {
    return null;
  }
  
  const expectedWeightChange = (this.goalWeight.weight - this.startingWeight.weight) * (daysElapsed / totalDays);
  const actualWeightChange = lastEntry.weight - this.startingWeight.weight;
  
  // Consider on track if within 0.5kg of expected
  return Math.abs(actualWeightChange - expectedWeightChange) <= 0.5;
};

// Add a compound index for user and entry date
progressSchema.index({ userId: 1, 'entries.date': -1 });

// Pre-save hook to update lastUpdated
progressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // If this is the first entry, set it as the starting weight
  if (this.entries && this.entries.length === 1 && !this.startingWeight) {
    this.startingWeight = {
      weight: this.entries[0].weight,
      date: this.entries[0].date
    };
  }
  
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
