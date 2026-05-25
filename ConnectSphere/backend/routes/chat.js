const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware.protect, chatController.createOrGetChat);
router.get('/', authMiddleware.protect, chatController.getUserChats);
router.post('/messages', authMiddleware.protect, chatController.sendMessage);
router.get('/:chatId/messages', authMiddleware.protect, chatController.getChatMessages);
router.put('/messages/read', authMiddleware.protect, chatController.markAsRead);
router.post('/messages/reaction', authMiddleware.protect, chatController.addReaction);

module.exports = router;