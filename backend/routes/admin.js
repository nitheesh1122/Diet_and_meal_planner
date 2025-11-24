const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboardStats, getAllUsers, updateUserStatus } = require('../controllers/admin');
const { protectAdmin, requireSuperAdmin } = require('../middleware/adminAuth');

router.post('/login', loginAdmin);
router.get('/stats', protectAdmin, requireSuperAdmin, getDashboardStats);
router.get('/users', protectAdmin, requireSuperAdmin, getAllUsers);
router.patch('/users/:id/status', protectAdmin, requireSuperAdmin, updateUserStatus);

module.exports = router;
