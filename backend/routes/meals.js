const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMealsByUser, addMealForUser } = require('../controllers/meals');
const { getRecommendations } = require('../controllers/recommendations');
const { generatePlans } = require('../controllers/generate');

// GET /api/meals/:userId
router.get('/:userId', protect, getMealsByUser);

// POST /api/meals/:userId
router.post('/:userId', protect, addMealForUser);

// GET /api/meals/:userId/recommendations
router.get('/:userId/recommendations', protect, getRecommendations);

// POST /api/meals/:userId/generate
router.post('/:userId/generate', protect, generatePlans);

module.exports = router;
