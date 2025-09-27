const MealPlan = require('../models/Meal');
const Food = require('../models/Food');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Heuristic meal recommendations based on remaining macros/calories
// @route GET /api/meals/:userId/recommendations?date=YYYY-MM-DD&limit=10
// @access Private (owner)
async function getRecommendations(req, res, next) {
  try {
    const { userId } = req.params;
    const { date, limit = 10, sources } = req.query;

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to access recommendations for this user', 403));
    }

    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('User not found', 404));

    const targetDate = date ? new Date(date) : new Date();
    const plan = await MealPlan.getOrCreate(userId, targetDate);

    // Remaining macros
    const remain = {
      calories: Math.max(0, (user.dailyCalorieGoal || 0) - (plan.totalCalories || 0)),
      protein: Math.max(0, (user.dailyProteinGoal || 0) - (plan.totalProtein || 0)),
      carbs: Math.max(0, (user.dailyCarbsGoal || 0) - (plan.totalCarbs || 0)),
      fat: Math.max(0, (user.dailyFatGoal || 0) - (plan.totalFat || 0))
    };

    // Basic strategy:
    // - If protein remaining is high, prioritize high protein per 100 kcal
    // - Otherwise, match foods where calories <= remaining + 20% and macros roughly align
    // - Slightly penalize fat if goal is 'lose'
    const goal = user.goal || 'maintain';

    // Select source files to include in recommendations (defaults to the 5 specified datasets)
    const defaultSources = [
      'foods',
      'foods_indian_a',
      'foods_indian_b',
      'foods_indian_c',
      'south_indian_foods'
    ];
    const allowedSources = (sources ? String(sources).split(',') : defaultSources).map(s => s.trim()).filter(Boolean);

    // Fetch a diverse random pool filtered by allowed sources; vary on each call
    const pool = await Food.aggregate([
      { $match: { source: { $in: allowedSources } } },
      { $sample: { size: 800 } },
      { $project: { name: 1, calories: 1, protein: 1, carbs: 1, fat: 1, servingSize: 1, category: 1 } }
    ]);

    const scored = pool.map(f => {
      const cal = f.calories || 0;
      const p = f.protein || 0;
      const c = f.carbs || 0;
      const fat = f.fat || 0;

      const proteinDensity = cal > 0 ? p / (cal / 100) : 0; // g per 100 kcal
      const carbDensity = cal > 0 ? c / (cal / 100) : 0;
      const fatDensity = cal > 0 ? fat / (cal / 100) : 0;

      const calFit = cal <= (remain.calories * 1.2) ? 1 : Math.max(0, 1 - (cal - remain.calories * 1.2) / (remain.calories + 1));
      const proteinFit = remain.protein > 0 ? Math.min(1, p / Math.max(10, remain.protein)) : 0.3;
      const carbFit = remain.carbs > 0 ? Math.min(1, c / Math.max(20, remain.carbs)) : 0.3;
      const fatFit = remain.fat > 0 ? Math.min(1, fat / Math.max(10, remain.fat)) : 0.3;

      let score = 0.0;
      // Weight protein higher generally
      score += proteinDensity * 1.5 + proteinFit * 1.0;
      // Carbs moderate
      score += carbDensity * 0.6 + carbFit * 0.5;
      // Fat minimal unless goal is gain
      const fatWeight = goal === 'gain' ? 0.6 : goal === 'maintain' ? 0.4 : 0.2;
      score += (1 - fatDensity) * fatWeight + fatFit * (fatWeight / 2);
      // Calories fit bonus
      score += calFit * 1.0;
      // Small randomness to avoid same items dominating
      score += Math.random() * 0.25;

      return { food: f, score };
    })
    // Basic filtering: keep plausible ones
    .filter(x => x.food.calories <= Math.max(150, remain.calories + 250))
    // Sort by score desc
    .sort((a, b) => b.score - a.score);

    // Promote category diversity: pick in round-robin from top N
    const byCategory = new Map();
    for (const item of scored) {
      const cat = item.food.category || 'other';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(item.food);
    }

    const result = [];
    const maxOut = Number(limit);
    const cats = Array.from(byCategory.keys());
    let i = 0;
    while (result.length < maxOut && byCategory.size > 0) {
      const cat = cats[i % cats.length];
      const arr = byCategory.get(cat);
      if (arr && arr.length) {
        result.push(arr.shift());
      } else {
        byCategory.delete(cat);
      }
      i++;
      // Rebuild cats list occasionally
      if (i % cats.length === 0) {
        cats.splice(0, cats.length, ...Array.from(byCategory.keys()));
        if (!cats.length) break;
      }
    }

    res.json({ success: true, data: result, remain });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
