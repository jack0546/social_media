const express = require('express');
const callController = require('../controllers/callController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/initiate', authMiddleware.protect, callController.initiateCall);
router.post('/answer', authMiddleware.protect, callController.answerCall);
router.post('/reject', authMiddleware.protect, callController.rejectCall);
router.post('/end', authMiddleware.protect, callController.endCall);
router.get('/history', authMiddleware.protect, callController.getCallHistory);

module.exports = router;