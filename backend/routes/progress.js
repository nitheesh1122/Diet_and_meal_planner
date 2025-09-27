const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProgressByUser, addProgressEntry } = require('../controllers/progress');

// GET /api/progress/:userId
router.get('/:userId', protect, getProgressByUser);

// POST /api/progress/:userId
router.post('/:userId', protect, addProgressEntry);

module.exports = router;
