const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware.protect, notificationController.getUserNotifications);
router.put('/:notificationId/read', authMiddleware.protect, notificationController.markAsRead);

module.exports = router;