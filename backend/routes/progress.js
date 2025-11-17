const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProgressByUser, addProgressEntry, updateProgressGoal } = require('../controllers/progress');

// GET /api/progress/:userId
router.get('/:userId', protect, getProgressByUser);

// POST /api/progress/:userId
router.post('/:userId', protect, addProgressEntry);

// PUT /api/progress/:userId/goal
router.put('/:userId/goal', protect, updateProgressGoal);

module.exports = router;
