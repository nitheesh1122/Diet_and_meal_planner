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
      { path: 'meals.breakfast.food', select: 'name servingSize category' },
      { path: 'meals.lunch.food', select: 'name servingSize category' },
      { path: 'meals.dinner.food', select: 'name servingSize category' },
      { path: 'meals.snacks.food', select: 'name servingSize category' }
    ]);

    // Simple unit normalization
    const toBase = (unit, amount) => {
      const u = String(unit || '').toLowerCase();
      const a = Number(amount || 0);
      if (u === 'tsp') return { unit: 'ml', amount: a * 5 };
      if (u === 'tbsp') return { unit: 'ml', amount: a * 15 };
      if (u === 'cup') return { unit: 'ml', amount: a * 240 };
      if (u === 'slice') return { unit: 'piece', amount: a };
      if (u === 'piece') return { unit: 'piece', amount: a };
      if (u === 'small' || u === 'medium' || u === 'large') return { unit: 'piece', amount: a };
      if (u === 'ml' || u === 'l') return { unit: 'ml', amount: u === 'l' ? a * 1000 : a };
      // default weight as grams
      if (u === 'g' || u === 'kg') return { unit: 'g', amount: u === 'kg' ? a * 1000 : a };
      return { unit: u || 'g', amount: a };
    };

    // Heuristic: expand each meal item into recipe ingredients
    const map = new Map();
    const mapsByMeal = {
      breakfast: new Map(),
      lunch: new Map(),
      dinner: new Map(),
      snacks: new Map()
    };
    const pushIng = (name, unit, amount, category='other', mealType=null) => {
      const key = `${name}|${unit}`;
      const prev = map.get(key) || { name, unit, amount: 0, count: 0, category };
      prev.amount += Number(amount || 0);
      prev.count += 1;
      if (!prev.category && category) prev.category = category;
      map.set(key, prev);
      if (mealType && mapsByMeal[mealType]) {
        const m = mapsByMeal[mealType];
        const prevM = m.get(key) || { name, unit, amount: 0, count: 0, category };
        prevM.amount += Number(amount || 0);
        prevM.count += 1;
        if (!prevM.category && category) prevM.category = category;
        m.set(key, prevM);
      }
    };

    const ingredientsFor = (foodName, category, tags, base) => {
      const name = String(foodName || '').toLowerCase();
      const t = (tags || []).map(s => String(s).toLowerCase());
      const list = [];
      // Helper add
      const add = (n, u, a, c) => list.push({ name: n, unit: u, amount: a, category: c });

      // Protein-centric dishes
      if (name.includes('tandoori') && name.includes('chicken')) {
        add('chicken', 'g', base.unit==='g'? base.amount : 200, 'protein');
        add('yogurt', 'ml', 100, 'dairy');
        add('tandoori masala', 'tbsp', 2, 'spices');
        add('garlic', 'tsp', 1, 'vegetables');
        add('lemon', 'piece', 1, 'fruits');
        add('salt', 'tsp', 1, 'spices');
        add('oil', 'tbsp', 1, 'fats');
        return list;
      }

      if (name.includes('grilled') && name.includes('chicken')) {
        add('chicken', 'g', base.unit==='g'? base.amount : 200, 'protein');
        add('olive oil', 'tbsp', 1, 'fats');
        add('garlic', 'tsp', 1, 'vegetables');
        add('salt', 'tsp', 1, 'spices');
        add('pepper', 'tsp', 0.5, 'spices');
        return list;
      }

      if (name.includes('paneer')) {
        add('paneer', 'g', base.unit==='g'? base.amount : 150, 'protein');
        add('onion', 'piece', 1, 'vegetables');
        add('tomato', 'piece', 1, 'vegetables');
        add('garam masala', 'tsp', 1, 'spices');
        add('turmeric', 'tsp', 0.5, 'spices');
        add('oil', 'tbsp', 1, 'fats');
        add('salt', 'tsp', 1, 'spices');
        return list;
      }

      if (name.includes('dal') || name.includes('lentil')) {
        add('lentils', 'g', 100, 'grains');
        add('onion', 'piece', 1, 'vegetables');
        add('tomato', 'piece', 1, 'vegetables');
        add('turmeric', 'tsp', 0.5, 'spices');
        add('cumin', 'tsp', 1, 'spices');
        add('salt', 'tsp', 1, 'spices');
        return list;
      }

      if (name.includes('oats') || name.includes('porridge')) {
        add('oats', 'g', 60, 'grains');
        add('milk', 'ml', 200, 'dairy');
        add('honey', 'tbsp', 1, 'sweets');
        add('banana', 'piece', 1, 'fruits');
        return list;
      }

      if (name.includes('salad')) {
        add('lettuce', 'g', 100, 'vegetables');
        add('tomato', 'piece', 1, 'vegetables');
        add('cucumber', 'piece', 1, 'vegetables');
        add('olive oil', 'tbsp', 1, 'fats');
        add('lemon', 'piece', 1, 'fruits');
        add('salt', 'tsp', 1, 'spices');
        return list;
      }

      // Default: use the food itself
      add(foodName, base.unit, base.amount, category || 'other');
      return list;
    };

    for (const p of plans) {
      ['breakfast','lunch','dinner','snacks'].forEach(type => {
        (p.meals[type] || []).forEach((it) => {
          if (!it || !it.food) return;
          const base = toBase(it.servingSize?.unit, it.servingSize?.amount);
          const qty = Number(it.quantity || 1);
          const ings = ingredientsFor(it.food.name, it.food.category, it.food.tags, base);
          for (const ing of ings) {
            // normalize ingredient units
            const b = toBase(ing.unit, ing.amount);
            pushIng(ing.name, b.unit, (b.amount || 0) * qty, ing.category, type);
          }
        });
      })
    }

    const list = Array.from(map.values())
      .map(i => ({ ...i, amount: Math.round(i.amount) }))
      .sort((a,b) => a.name.localeCompare(b.name));

    // Group by category for convenience on the frontend
    const grouped = list.reduce((acc, i) => {
      const cat = i.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(i);
      return acc;
    }, {});

    // Build groupedByMeal similarly
    const groupedByMeal = Object.fromEntries(Object.entries(mapsByMeal).map(([k, m]) => {
      const arr = Array.from(m.values()).map(i => ({ ...i, amount: Math.round(i.amount) })).sort((a,b) => a.name.localeCompare(b.name));
      return [k, arr];
    }));

    res.json({ success: true, data: { items: list, grouped, groupedByMeal, range: { start, end }, totalItems: list.length } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGroceryList };
