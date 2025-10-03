const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // ✅ load .env from backend

const mongoose = require('mongoose');
const fs = require('fs');
const Food = require('../models/Food'); // adjust path if needed

const dataDir = path.join(__dirname, '..', 'data');

async function connectDB() {
  try {
    console.log("Loaded MONGO_URI:", process.env.MONGO_URI ? "✅ Found" : "❌ Missing");
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

async function importFoods() {
  try {
    // Fix legacy indexes (drop unique name index if present)
    try {
      const indexes = await Food.collection.indexes();
      const hasNameOnly = indexes.find(ix => ix.name === 'name_1');
      if (hasNameOnly) {
        console.log('  Dropping legacy index name_1...');
        await Food.collection.dropIndex('name_1');
      }
      await Food.syncIndexes();
      console.log('  Indexes synced.');
    } catch (e) {
      console.log('  Index sync note:', e.message);
    }

    // Purge old seeded dataset (keep custom)
    const purge = await Food.deleteMany({ isCustom: false });
    console.log(`  Purged ${purge.deletedCount} existing seeded foods.`);

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    let foods = [];

    for (const file of files) {
      const full = path.join(dataDir, file);
      const raw = fs.readFileSync(full, 'utf-8');
      const arr = JSON.parse(raw);
      const source = path.basename(file, '.json');
      const autoTags = [];
      // infer mealType from filename
      let mealType = null;
      if (/breakfast/i.test(source)) mealType = 'breakfast';
      else if (/lunch/i.test(source)) mealType = 'lunch';
      else if (/dinner/i.test(source)) mealType = 'dinner';
      else if (/snack|snacks/i.test(source)) mealType = 'snacks';
      // infer goal from filename
      let goal = null;
      if (/lose/i.test(source)) goal = 'lose';
      else if (/maintain/i.test(source)) goal = 'maintain';
      else if (/gain/i.test(source)) goal = 'gain';
      // infer dietaryType from filename
      let dietaryType = null;
      if (source.includes('_veg') || source.includes('-veg')) dietaryType = 'vegetarian';
      else if (source.includes('_nonveg') || source.includes('-nonveg')) dietaryType = 'non-vegetarian';
      else dietaryType = 'vegetarian'; // default fallback

      for (const item of arr) {
        // immutable/internal fields
        delete item._id; delete item.__v; delete item.createdAt; delete item.updatedAt;
        // dataset flags
        item.isCustom = false;
        item.source = source;
        if (!item.tags) item.tags = [];
        // merge inferred tags
        item.tags = Array.from(new Set([...(item.tags||[]), ...autoTags]));
        // attach mealType and goal inferred from filename unless explicitly provided
        if (!item.mealType && mealType) item.mealType = mealType;
        if (!item.goal && goal) item.goal = goal;
        if (!item.dietaryType && dietaryType) item.dietaryType = dietaryType;
      }
      foods = foods.concat(arr);
    }

    // upsert by name + mealType + goal + dietaryType (nulls allowed)
    for (const f of foods) {
      const filter = { name: f.name };
      filter.mealType = f.mealType ? f.mealType : null;
      filter.goal = f.goal ? f.goal : null;
      filter.dietaryType = f.dietaryType ? f.dietaryType : null;
      await Food.updateOne(filter, { $set: f }, { upsert: true });
    }
    console.log(`  Inserted/updated ${foods.length} foods from ${files.length} file(s). Meal types and goals inferred from filenames.`);
  } catch (err) {
    console.error('  Error importing foods:', err.message);
  }
}

async function run() {
  await connectDB();
  await importFoods();
  await mongoose.disconnect();
  console.log('🌱 Seeding complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
