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

    res.status(200).json({ success: true, data: progress });
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
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProgressByUser, addProgressEntry };
