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

    // Generate days in parallel for better performance
    const generateDay = async (i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);

      // Ensure a plan exists
      const plan = await MealPlan.getOrCreate(userId, d);

      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

      // Per-meal calorie allocation
      const dailyGoal = user.dailyCalorieGoal || 2000;
      const splits = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snacks: 0.10 };

      // Track foods already present in this day's plan to avoid duplicates within the day
      // Also track per meal type to prevent duplicates within the same meal type
      const usedDay = new Set();
      const usedPerMealType = {
        breakfast: new Set(),
        lunch: new Set(),
        dinner: new Set(),
        snacks: new Set()
      };

      mealTypes.forEach(type => {
        for (const it of (plan.meals[type] || [])) {
          if (it && it.food) {
            usedDay.add(String(it.food));
            usedPerMealType[type].add(String(it.food));
          }
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

        // Filter out duplicates: not used in this meal type, not used in the day, and not used globally
        pool = pool.filter(f => {
          if (!f || !f._id) return false;
          const foodId = String(f._id);
          // Prevent duplicates within the same meal type
          if (usedPerMealType[type].has(foodId)) return false;
          // Also check day and global to diversify
          if (usedDay.has(foodId)) return false;
          // Note: usedGlobal is shared across parallel executions, so we might have race conditions 
          // but it's acceptable for meal generation variety.
          // To be safe, we can skip global check or use a shared Set with mutex (too complex).
          // For now, we'll just check it, but acknowledge it might not be perfectly up to date.
          if (usedGlobal.has(foodId)) return false;
          return true;
        });
        // Sort ascending calories for greedy fit
        pool.sort((a, b) => (a.calories || 0) - (b.calories || 0));

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
            usedPerMealType[type].add(String(f._id));
            usedGlobal.add(String(f._id));
            remain -= kcal;
            added.push(f);
          }
          if (added.length >= 4) break; // keep each meal concise
        }
        totalAdded += added.length;
      }

      // After initial generation, check nutrition gaps and fill them
      await plan.save();

      // Calculate current totals (no need to populate - values are already in meal items)
      const calculateTotals = (mealType) => {
        return (plan.meals[mealType] || []).reduce((acc, item) => {
          const qty = item.quantity || 1;
          return {
            calories: acc.calories + (item.calories || 0) * qty,
            protein: acc.protein + (item.protein || 0) * qty,
            carbs: acc.carbs + (item.carbs || 0) * qty,
            fat: acc.fat + (item.fat || 0) * qty
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      };

      const breakfastTotals = calculateTotals('breakfast');
      const lunchTotals = calculateTotals('lunch');
      const dinnerTotals = calculateTotals('dinner');
      const snacksTotals = calculateTotals('snacks');

      const currentTotals = {
        calories: breakfastTotals.calories + lunchTotals.calories + dinnerTotals.calories + snacksTotals.calories,
        protein: breakfastTotals.protein + lunchTotals.protein + dinnerTotals.protein + snacksTotals.protein,
        carbs: breakfastTotals.carbs + lunchTotals.carbs + dinnerTotals.carbs + snacksTotals.carbs,
        fat: breakfastTotals.fat + lunchTotals.fat + dinnerTotals.fat + snacksTotals.fat
      };

      // Get user's nutrition goals (dailyGoal already declared above)
      const proteinGoal = user.dailyProteinGoal || Math.round((dailyGoal * 0.30) / 4);
      const carbsGoal = user.dailyCarbsGoal || Math.round((dailyGoal * 0.40) / 4);
      const fatGoal = user.dailyFatGoal || Math.round((dailyGoal * 0.30) / 9);

      // Calculate gaps (allow 5% tolerance)
      const gaps = {
        calories: Math.max(0, dailyGoal * 0.95 - currentTotals.calories),
        protein: Math.max(0, proteinGoal * 0.95 - currentTotals.protein),
        carbs: Math.max(0, carbsGoal * 0.95 - currentTotals.carbs),
        fat: Math.max(0, fatGoal * 0.95 - currentTotals.fat)
      };

      // If there are significant gaps, add more foods
      const hasSignificantGap = gaps.calories > 100 || gaps.protein > 10 || gaps.carbs > 10 || gaps.fat > 5;

      if (hasSignificantGap) {
        // Determine which meal type needs more food (prioritize snacks, then dinner)
        const mealTypePriority = ['snacks', 'dinner', 'lunch', 'breakfast'];

        for (const type of mealTypePriority) {
          if (gaps.calories <= 50) break; // Stop if gap is small

          // Get a fresh pool for this meal type
          let pool = await Food.find({ mealType: type, goal: user.goal })
            .select('name calories protein carbs fat servingSize category dietaryType')
            .limit(200)
            .lean();

          if (!pool || pool.length === 0) {
            pool = await Food.find({ mealType: type })
              .select('name calories protein carbs fat servingSize category dietaryType')
              .limit(200)
              .lean();
          }

          // Filter based on dietary restrictions
          const userDietaryRestrictions = user.preferences?.dietaryRestrictions || ['none'];
          if (!userDietaryRestrictions.includes('none')) {
            pool = pool.filter(food => {
              if (userDietaryRestrictions.includes('vegetarian')) {
                return food.dietaryType === 'vegetarian' || food.dietaryType === 'vegan';
              }
              if (userDietaryRestrictions.includes('vegan')) {
                return food.dietaryType === 'vegan';
              }
              return true;
            });
          }

          // Filter out duplicates
          pool = pool.filter(f => {
            if (!f || !f._id) return false;
            const foodId = String(f._id);
            return !usedPerMealType[type].has(foodId) && !usedDay.has(foodId);
          });

          // Sort by how well they fill the gaps (prioritize foods that help with multiple gaps)
          pool.sort((a, b) => {
            const scoreA = (a.calories || 0) + (a.protein || 0) * 4 + (a.carbs || 0) * 4 + (a.fat || 0) * 9;
            const scoreB = (b.calories || 0) + (b.protein || 0) * 4 + (b.carbs || 0) * 4 + (b.fat || 0) * 9;
            return scoreB - scoreA; // Higher score first
          });

          // Add foods to fill gaps
          let addedForGaps = 0;
          for (const f of pool) {
            if (gaps.calories <= 50) break;
            if (addedForGaps >= 2) break; // Limit additions per meal type

            const kcal = f.calories || 0;
            if (kcal > 0 && kcal <= gaps.calories + 200) { // Allow slight overage
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
              usedPerMealType[type].add(String(f._id));
              usedGlobal.add(String(f._id));

              gaps.calories = Math.max(0, gaps.calories - kcal);
              gaps.protein = Math.max(0, gaps.protein - (f.protein || 0));
              gaps.carbs = Math.max(0, gaps.carbs - (f.carbs || 0));
              gaps.fat = Math.max(0, gaps.fat - (f.fat || 0));

              addedForGaps++;
              totalAdded++;
            }
          }
        }
      }

      await plan.save();
      return { date: d, itemsAdded: totalAdded };
    };

    // Run all days in parallel
    const promises = [];
    for (let i = 0; i < days; i++) {
      promises.push(generateDay(i));
    }

    const results = await Promise.all(promises);
    results.forEach(r => created.push(r));

    res.status(201).json({ success: true, data: { daysGenerated: days, summary: created } });
  } catch (err) {
    next(err);
  }
}

module.exports = { generatePlans };
