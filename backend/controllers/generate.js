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
// body: { startDate, span: 'daily'|'weekly'|'monthly' }
// Creates meal plans per day by selecting foods from the categorized datasets (mealType × goal)
// to roughly fit daily calories with per-meal allocations.
async function generatePlans(req, res, next) {
  try {
    const { userId } = req.params;
    const { startDate, span = 'daily' } = req.body || {};

    if (!req.user || req.user._id.toString() !== userId) {
      return next(new ErrorResponse('Not authorized to generate plans for this user', 403));
    }

    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('User not found', 404));

    if (!startDate) return next(new ErrorResponse('startDate is required (YYYY-MM-DD)', 400));

    const days = span === 'weekly' ? 7 : span === 'monthly' ? 30 : 1;
    const created = [];
    const usedGlobal = new Set(); // track used foods across the generation window to diversify days

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);

      // Ensure a plan exists
      const plan = await MealPlan.getOrCreate(userId, d);

      const mealTypes = ['breakfast','lunch','dinner','snacks'];

      // Per-meal calorie allocation
      const dailyGoal = user.dailyCalorieGoal || 2000;
      const splits = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snacks: 0.10 };

      // Track foods already present in this day's plan to avoid duplicates within the day
      const usedDay = new Set();
      mealTypes.forEach(type => {
        for (const it of (plan.meals[type] || [])) {
          if (it && it.food) usedDay.add(String(it.food));
        }
      });

      // For each meal type, fetch a pool filtered by user's goal and fill up to target calories
      let totalAdded = 0;
      for (const type of mealTypes) {
        const target = Math.round(dailyGoal * (splits[type] || 0.25));
        const existing = (plan.meals[type] || []).reduce((sum, it) => sum + (it.calories || 0), 0);
        let remain = Math.max(0, target - existing);
        if (remain <= 100) continue; // skip small remainder

        // Pull suitable foods by mealType + goal
        let pool = await Food.find({ mealType: type, goal: user.goal })
          .select('name calories protein carbs fat servingSize category dietaryType')
          .limit(200)
          .lean();
        // fallbacks
        if (!pool || pool.length === 0) {
          pool = await Food.find({ mealType: type })
            .select('name calories protein carbs fat servingSize category dietaryType')
            .limit(200)
            .lean();
        }
        if (!pool || pool.length === 0) {
          pool = await Food.find({})
            .select('name calories protein carbs fat servingSize category dietaryType')
            .limit(200)
            .lean();
        }

        // Filter based on user's dietary preferences
        const userDietaryRestrictions = user.preferences?.dietaryRestrictions || ['none'];
        if (!userDietaryRestrictions.includes('none')) {
          pool = pool.filter(food => {
            // If user is vegetarian, only include vegetarian or vegan foods
            if (userDietaryRestrictions.includes('vegetarian')) {
              return food.dietaryType === 'vegetarian' || food.dietaryType === 'vegan';
            }
            // If user is vegan, only include vegan foods
            if (userDietaryRestrictions.includes('vegan')) {
              return food.dietaryType === 'vegan';
            }
            // If user is non-vegetarian, include all foods
            if (userDietaryRestrictions.includes('non-vegetarian')) {
              return true;
            }
            // Default: include all foods if no specific restriction
            return true;
          });
        }

        // Filter out duplicates for the day/run
        pool = pool.filter(f => f && f._id && !usedDay.has(String(f._id)) && !usedGlobal.has(String(f._id)));
        // Sort ascending calories for greedy fit
        pool.sort((a,b) => (a.calories||0) - (b.calories||0));

        const added = [];
        for (const f of pool) {
          if (remain <= 120) break; // tail cutoff
          const kcal = f.calories || 0;
          if (kcal <= remain) {
            plan.meals[type].push({
              food: f._id,
              quantity: 1,
              servingSize: f.servingSize,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat
            });
            usedDay.add(String(f._id));
            usedGlobal.add(String(f._id));
            remain -= kcal;
            added.push(f);
          }
          if (added.length >= 4) break; // keep each meal concise
        }
        totalAdded += added.length;
      }

      await plan.save();
      created.push({ date: d, itemsAdded: totalAdded });
    }

    res.status(201).json({ success: true, data: { daysGenerated: days, summary: created } });
  } catch (err) {
    next(err);
  }
}

module.exports = { generatePlans };
