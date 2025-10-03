const MealPlan = require('../models/Meal');
const Food = require('../models/Food');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get meals for a user (by date optional)
// @route   GET /api/meals/:userId?date=YYYY-MM-DD
// @access  Private (owner)
const getMealsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to access meals for this user', 403));
    }

    const targetDate = date ? new Date(date) : new Date();
    let plan = await MealPlan.getOrCreate(userId, targetDate);
  plan = await plan.populate([
    { path: 'meals.breakfast.food', select: 'name servingSize category tags' },
    { path: 'meals.lunch.food', select: 'name servingSize category tags' },
    { path: 'meals.dinner.food', select: 'name servingSize category tags' },
    { path: 'meals.snacks.food', select: 'name servingSize category tags' }
  ]);

  res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Add meal items for a user for a given date and meal type
// @route   POST /api/meals/:userId
// @access  Private (owner)
// body: { date: 'YYYY-MM-DD', mealType: 'breakfast'|'lunch'|'dinner'|'snacks', items: [{ foodId, quantity }] }
const addMealForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, mealType, items } = req.body;

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to update meals for this user', 403));
    }

    if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
      return next(new ErrorResponse('Invalid meal type', 400));
    }

    const targetDate = date ? new Date(date) : new Date();
    const plan = await MealPlan.getOrCreate(userId, targetDate);

    // Build meal items from food data
    const foodIds = items.map(i => i.foodId);
    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodMap = new Map(foods.map(f => [f._id.toString(), f]));

    const builtItems = items.map(i => {
      const f = foodMap.get(i.foodId);
      if (!f) return null;
      const quantity = Number(i.quantity) || 1;
      return {
        food: f._id,
        quantity,
        servingSize: f.servingSize,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat
      };
    }).filter(Boolean);

    plan.meals[mealType] = plan.meals[mealType].concat(builtItems);
    let saved = await plan.save();
  saved = await saved.populate([
    { path: 'meals.breakfast.food', select: 'name servingSize category tags' },
    { path: 'meals.lunch.food', select: 'name servingSize category tags' },
    { path: 'meals.dinner.food', select: 'name servingSize category tags' },
    { path: 'meals.snacks.food', select: 'name servingSize category tags' }
  ]);

  res.status(200).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMealsByUser, addMealForUser };
// @desc    Clear meals for a user for a given date (reset all meal items)
// @route   DELETE /api/meals/:userId?date=YYYY-MM-DD
// @access  Private (owner)
const clearMealsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to clear meals for this user', 403));
    }

    const targetDate = date ? new Date(date) : new Date();
    let plan = await MealPlan.getOrCreate(userId, targetDate);
    plan.meals.breakfast = [];
    plan.meals.lunch = [];
    plan.meals.dinner = [];
    plan.meals.snacks = [];
    plan = await plan.save();
    plan = await plan.populate([
      { path: 'meals.breakfast.food', select: 'name' },
      { path: 'meals.lunch.food', select: 'name' },
      { path: 'meals.dinner.food', select: 'name' },
      { path: 'meals.snacks.food', select: 'name' }
    ]);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMealsByUser, addMealForUser, clearMealsByUser };
