const Food = require('../models/Food');
const ErrorResponse = require('../utils/errorResponse');

// @desc    List foods (with optional search)
// @route   GET /api/foods
// @access  Public
const listFoods = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (q && q.trim()) {
      query = { $text: { $search: q.trim() } };
    }

    const [items, total] = await Promise.all([
      Food.find(query)
        .sort(q ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .select('name calories protein carbs fat servingSize category'),
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
