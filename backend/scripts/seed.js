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

    // Delete ALL foods from database (complete reset)
    const purge = await Food.deleteMany({});
    console.log(`  ✅ Deleted ${purge.deletedCount} existing foods from database.`);

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    console.log(`  📁 Found ${files.length} JSON file(s) to import.`);
    
    if (files.length === 0) {
      console.log('  ⚠️  No JSON files found in data directory!');
      return;
    }

    let foods = [];
    let totalProcessed = 0;

    for (const file of files) {
      const full = path.join(dataDir, file);
      const source = path.basename(file, '.json');
      console.log(`  📄 Processing: ${file}...`);
      
      try {
        const raw = fs.readFileSync(full, 'utf-8');
        const arr = JSON.parse(raw);
        console.log(`    Found ${arr.length} items in ${file}`);
        
        // Infer goal from filename (maintain, lose, gain)
        let goalFromFilename = null;
        if (/lose/i.test(source)) goalFromFilename = 'lose';
        else if (/maintain/i.test(source)) goalFromFilename = 'maintain';
        else if (/gain/i.test(source)) goalFromFilename = 'gain';

        for (const item of arr) {
          // Remove immutable/internal fields
          delete item._id; 
          delete item.__v; 
          delete item.createdAt; 
          delete item.updatedAt;
          delete item.type; // Remove old 'type' field if present
          
          // Set dataset flags
          item.isCustom = false;
          item.source = source;
          
          // Ensure tags array exists
          if (!item.tags) item.tags = [];
          
          // Set goal: use item's goal if present, otherwise infer from filename
          if (!item.goal && goalFromFilename) {
            item.goal = goalFromFilename;
          }
          
          // Validate required fields
          if (!item.name) {
            console.warn(`    ⚠️  Skipping item without name`);
            continue;
          }
          
          if (!item.mealType) {
            console.warn(`    ⚠️  Skipping "${item.name}" - missing mealType`);
            continue;
          }
          
          if (!item.dietaryType) {
            console.warn(`    ⚠️  Skipping "${item.name}" - missing dietaryType`);
            continue;
          }
          
          // Normalize dietaryType values
          if (item.dietaryType === 'veg' || item.dietaryType === 'vegetarian') {
            item.dietaryType = 'vegetarian';
          } else if (item.dietaryType === 'nonveg' || item.dietaryType === 'non-vegetarian') {
            item.dietaryType = 'non-vegetarian';
          } else if (item.dietaryType === 'vegan') {
            item.dietaryType = 'vegan';
          }
          
          // Normalize mealType values
          if (item.mealType === 'snack') {
            item.mealType = 'snacks';
          }
          
          // Fix category field - JSON has mealType values in category field
          // Map invalid categories to valid enum values
          const validCategories = ['dairy', 'protein', 'grains', 'fruits', 'vegetables', 'fats', 'sweets', 'beverages', 'other'];
          if (item.category && !validCategories.includes(item.category.toLowerCase())) {
            // If category is a mealType value, set to 'other' and keep mealType separate
            if (['breakfast', 'lunch', 'dinner', 'snacks'].includes(item.category.toLowerCase())) {
              item.category = 'other';
            } else {
              // Try to infer category from name or set to 'other'
              const nameLower = item.name.toLowerCase();
              if (nameLower.includes('milk') || nameLower.includes('cheese') || nameLower.includes('yogurt') || nameLower.includes('paneer')) {
                item.category = 'dairy';
              } else if (nameLower.includes('chicken') || nameLower.includes('fish') || nameLower.includes('egg') || nameLower.includes('meat')) {
                item.category = 'protein';
              } else if (nameLower.includes('rice') || nameLower.includes('wheat') || nameLower.includes('roti') || nameLower.includes('bread') || nameLower.includes('dal') || nameLower.includes('lentil')) {
                item.category = 'grains';
              } else if (nameLower.includes('fruit') || nameLower.includes('banana') || nameLower.includes('apple') || nameLower.includes('orange')) {
                item.category = 'fruits';
              } else if (nameLower.includes('vegetable') || nameLower.includes('sabzi') || nameLower.includes('curry')) {
                item.category = 'vegetables';
              } else {
                item.category = 'other';
              }
            }
          } else if (!item.category) {
            item.category = 'other';
          } else {
            item.category = item.category.toLowerCase();
          }
          
          foods.push(item);
          totalProcessed++;
        }
      } catch (err) {
        console.error(`    ❌ Error processing ${file}:`, err.message);
      }
    }

    console.log(`  📊 Total items processed: ${totalProcessed}`);
    console.log(`  💾 Inserting foods into database...`);

    // Insert all foods - use a unique combination to avoid duplicates
    // Include servingSize in the filter to handle same name but different portions
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const f of foods) {
      // Create a more unique filter that includes serving size to distinguish similar items
      const filter = { 
        name: f.name,
        mealType: f.mealType || null,
        goal: f.goal || null,
        dietaryType: f.dietaryType || null,
        'servingSize.amount': f.servingSize?.amount || null,
        'servingSize.unit': f.servingSize?.unit || null
      };
      
      // Check if this exact combination already exists
      const existing = await Food.findOne(filter);
      if (existing) {
        // Update existing with latest data (including ingredients/recipe)
        await Food.updateOne(filter, { $set: f });
        updated++;
      } else {
        // Insert new food
        await Food.create(f);
        inserted++;
      }
    }
    
    console.log(`  ✅ Successfully inserted ${inserted} new foods.`);
    if (updated > 0) {
      console.log(`  ✅ Updated ${updated} existing foods.`);
    }
    const totalInDb = await Food.countDocuments({});
    console.log(`  📈 Total foods in database: ${totalInDb}`);
    
    if (totalInDb < totalProcessed) {
      console.log(`  ⚠️  Warning: ${totalProcessed - totalInDb} items may have been duplicates or failed to insert.`);
    }
  } catch (err) {
    console.error('  ❌ Error importing foods:', err.message);
    throw err;
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
