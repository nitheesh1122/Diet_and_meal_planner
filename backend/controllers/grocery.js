const MealPlan = require('../models/Meal');
const Food = require('../models/Food');
const ErrorResponse = require('../utils/errorResponse');

// Aggregate grocery list from meals in a date range
// GET /api/grocery/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Private (owner)
async function getGroceryList(req, res, next) {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to access this resource', 403));
    }

    // Default range: today
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0,0,0,0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23,59,59,999);

    // Fetch meal plans in range
    const plans = await MealPlan.find({
      userId,
      date: { $gte: start, $lte: end }
    }).populate([
      { path: 'meals.breakfast.food', select: 'name servingSize' },
      { path: 'meals.lunch.food', select: 'name servingSize' },
      { path: 'meals.dinner.food', select: 'name servingSize' },
      { path: 'meals.snacks.food', select: 'name servingSize' }
    ]);

    // Aggregate per food name + unit
    const map = new Map();
    const addItem = (item) => {
      if (!item || !item.food) return;
      const key = `${item.food.name}|${item.servingSize?.unit || 'g'}`;
      const prev = map.get(key) || { name: item.food.name, unit: item.servingSize?.unit || 'g', amount: 0, count: 0 };
      // amount is serving amount * quantity (approx); count increments items
      const amt = (item.servingSize?.amount || 1) * (item.quantity || 1);
      prev.amount += amt;
      prev.count += 1;
      map.set(key, prev);
    };

    for (const p of plans) {
      ['breakfast','lunch','dinner','snacks'].forEach(type => {
        (p.meals[type] || []).forEach(addItem);
      })
    }

    const list = Array.from(map.values()).sort((a,b) => a.name.localeCompare(b.name));

    res.json({ success: true, data: { items: list, range: { start, end }, totalItems: list.length } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGroceryList };
