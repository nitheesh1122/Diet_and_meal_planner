const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMealsByUser, addMealForUser, removeMealItem, getMealsRange, clearMealsByUser } = require('../controllers/meals');
const { getRecommendations } = require('../controllers/recommendations');
const { generatePlans } = require('../controllers/generate');

// GET /api/meals/:userId/range
router.get('/:userId/range', protect, getMealsRange);

// GET /api/meals/:userId
router.get('/:userId', protect, getMealsByUser);

// POST /api/meals/:userId
router.post('/:userId', protect, addMealForUser);

// DELETE /api/meals/:userId/item
router.delete('/:userId/item', protect, removeMealItem);

// GET /api/meals/:userId/recommendations
router.get('/:userId/recommendations', protect, getRecommendations);

// POST /api/meals/:userId/generate
router.post('/:userId/generate', protect, generatePlans);

// DELETE /api/meals/:userId
router.delete('/:userId', protect, clearMealsByUser);

module.exports = router;
