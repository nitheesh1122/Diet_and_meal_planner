const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGroceryList } = require('../controllers/grocery');

// GET /api/grocery/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/:userId', protect, getGroceryList);

module.exports = router;
