const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listFoods, createFood } = require('../controllers/foods');

// GET /api/foods
router.get('/', listFoods);

// POST /api/foods (protected)
router.post('/', protect, createFood);

module.exports = router;
