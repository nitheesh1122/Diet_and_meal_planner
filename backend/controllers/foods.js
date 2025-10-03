const Food = require('../models/Food');
const ErrorResponse = require('../utils/errorResponse');

// @desc    List foods (with optional search)
// @route   GET /api/foods
// @access  Public
const listFoods = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 25, mealType, category, tags, goal, verified } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }
    if (mealType && mealType !== 'all') {
      query.mealType = mealType;
    }
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    if (tags) {
      const arr = String(tags).split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) query.tags = { $all: arr };
    }
    if (goal && goal !== 'all') {
      query.goal = goal;
    }
    if (typeof verified !== 'undefined') {
      const v = String(verified).toLowerCase();
      if (v === 'true' || v === '1') query.isVerified = true;
      if (v === 'false' || v === '0') query.isVerified = false;
    }

    const [items, total] = await Promise.all([
      Food.find(query)
        .sort(q ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .select('name calories protein carbs fat servingSize category mealType goal tags source'),
      Food.countDocuments(query)
    ]);

    res.status(200).json({ success: true, data: items, total });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new food
// @route   POST /api/foods
// @access  Private
const createFood = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.isCustom = true;
    payload.createdBy = req.user ? req.user._id : null;

    const food = await Food.create(payload);
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorResponse('A food with this name already exists', 400));
    }
    next(err);
  }
};

module.exports = { listFoods, createFood };
