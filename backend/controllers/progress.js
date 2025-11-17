const Progress = require('../models/Progress');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get progress entries for a user
// @route   GET /api/progress/:userId
// @access  Private (owner)
const getProgressByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to access this resource', 403));
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId, entries: [] });
    }

    // Convert to JSON to include virtuals
    const progressData = progress.toJSON({ virtuals: true });
    res.status(200).json({ success: true, data: progressData });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a progress entry (weight, etc.) for a user
// @route   POST /api/progress/:userId
// @access  Private (owner)
const addProgressEntry = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { weight, bodyFat, measurements, notes, date } = req.body;

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to update this resource', 403));
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId, entries: [] });
    }

    progress.entries.push({
      weight,
      bodyFat,
      measurements,
      notes,
      date: date ? new Date(date) : new Date()
    });

    const saved = await progress.save();
    const savedData = saved.toJSON({ virtuals: true });
    res.status(201).json({ success: true, data: savedData });
  } catch (err) {
    next(err);
  }
};

// @desc    Update progress goal
// @route   PUT /api/progress/:userId/goal
// @access  Private (owner)
const updateProgressGoal = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { goalWeight, targetDate } = req.body;

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to update this resource', 403));
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId, entries: [] });
    }

    progress.goalWeight = {
      weight: goalWeight,
      targetDate: targetDate ? new Date(targetDate) : undefined
    };

    // If starting weight is not set and we have entries, set it
    if (!progress.startingWeight && progress.entries && progress.entries.length > 0) {
      const sortedEntries = [...progress.entries].sort((a, b) => a.date - b.date);
      progress.startingWeight = {
        weight: sortedEntries[0].weight,
        date: sortedEntries[0].date
      };
    }

    const saved = await progress.save();
    const savedData = saved.toJSON({ virtuals: true });
    res.status(200).json({ success: true, data: savedData });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProgressByUser, addProgressEntry, updateProgressGoal };
