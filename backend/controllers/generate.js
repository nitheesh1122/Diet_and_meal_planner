const MealPlan = require('../models/Meal');
const { getRecommendations } = require('./recommendations');
const Food = require('../models/Food');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Helper to fetch recommendations programmatically
async function fetchRecommendations(userId, date, sources, limit, reqUser) {
  // Build a fake req/res to reuse recommendation scoring
  const req = { params: { userId }, query: { date, limit, sources }, user: reqUser };
  return new Promise((resolve, reject) => {
    const res = {
      json: ({ data }) => resolve(data)
    };
    getRecommendations(req, res, reject);
  });
}

// POST /api/meals/:userId/generate
// body: { startDate, span: 'daily'|'weekly'|'monthly', sources?: string }
// Creates meal plans for the date range by selecting recommended foods to roughly fit daily remaining calories/macros.
async function generatePlans(req, res, next) {
  try {
    const { userId } = req.params;
    const { startDate, span = 'daily', sources } = req.body || {};

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to generate plans for this user', 403));
    }

    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('User not found', 404));

    if (!startDate) return next(new ErrorResponse('startDate is required (YYYY-MM-DD)', 400));

    const days = span === 'weekly' ? 7 : span === 'monthly' ? 30 : 1;
    const created = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);

      // Ensure a plan exists
      const plan = await MealPlan.getOrCreate(userId, d);

      // Fetch recommendations pool (bigger limit to pick from)
      const recs = await fetchRecommendations(userId, d.toISOString().slice(0,10), sources, 30, req.user);

      // Simple heuristic: pick up to 4 items for breakfast/lunch/dinner/snacks totaling towards remaining daily calories
      const mealTypes = ['breakfast','lunch','dinner','snacks'];

      // Compute remaining macros again for this day (plan may already include entries)
      let remainCalories = Math.max(0, (user.dailyCalorieGoal || 0) - (plan.totalCalories || 0));

      // Greedy selection from recs by ascending calories to fit remaining
      const sorted = [...recs].sort((a,b) => a.calories - b.calories);
      const selected = [];
      for (const f of sorted) {
        if (selected.length >= 8) break; // cap daily additions
        if (f.calories <= Math.max(120, remainCalories)) { // flexible threshold
          selected.push(f);
          remainCalories -= f.calories;
        }
        if (remainCalories <= 120) break;
      }

      // Distribute into meal types round-robin
      let idx = 0;
      for (const f of selected) {
        const type = mealTypes[idx % mealTypes.length];
        plan.meals[type].push({
          food: f._id || f.id,
          quantity: 1,
          servingSize: f.servingSize,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat
        });
        idx++;
      }

      await plan.save();
      created.push({ date: d, itemsAdded: selected.length });
    }

    res.status(201).json({ success: true, data: { daysGenerated: days, summary: created } });
  } catch (err) {
    next(err);
  }
}

module.exports = { generatePlans };
