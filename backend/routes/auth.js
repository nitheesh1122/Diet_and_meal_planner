const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUserProfile,
  updateUserGoals,
  updateUserPreferences
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.put('/goals', protect, updateUserGoals);
router.put('/preferences', protect, updateUserPreferences);

module.exports = router;
