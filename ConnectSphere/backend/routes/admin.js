const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.admin);

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/ban', adminController.banUser);
router.put('/users/:userId/unban', adminController.unbanUser);
router.get('/analytics', adminController.getAnalytics);
router.get('/reports', adminController.getReports);

module.exports = router;