const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserById, updateUserById } = require('../controllers/users');

// GET /api/users/:id
router.get('/:id', protect, getUserById);

// PUT /api/users/:id
router.put('/:id', protect, updateUserById);

module.exports = router;
