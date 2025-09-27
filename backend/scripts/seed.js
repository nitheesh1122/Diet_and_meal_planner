require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Food = require('../models/Food');

const dataDir = path.join(__dirname, '..', 'data');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

async function importFoods() {
  try {
    // Load all *.json files in data directory and merge arrays
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    let foods = [];
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      const arr = JSON.parse(raw);
      const source = path.basename(file, '.json');
      const autoTags = [];
      if (/south[_-]?indian/i.test(source)) autoTags.push('south-indian');
      // Attach source and merge tags if not present
      for (const item of arr) {
        item.source = source;
        if (!item.tags) item.tags = [];
        item.tags = Array.from(new Set([...(item.tags||[]), ...autoTags]));
      }
      foods = foods.concat(arr);
    }
    // Upsert by name to avoid duplicates
    for (const f of foods) {
      await Food.updateOne({ name: f.name }, { $set: f }, { upsert: true });
    }
    console.log(`Imported/updated ${foods.length} foods.`);
  } catch (err) {
    console.error('Error importing foods:', err.message);
  }
}

async function run() {
  await connectDB();
  await importFoods();
  await mongoose.disconnect();
  console.log('Seeding complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
