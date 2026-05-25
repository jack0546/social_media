const express = require('express');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware.protect, postController.createPost);
router.get('/feed', authMiddleware.protect, postController.getFeedPosts);
router.post('/like', authMiddleware.protect, postController.toggleLike);
router.post('/comment', authMiddleware.protect, postController.addComment);
router.post('/share', authMiddleware.protect, postController.sharePost);
router.get('/user/:userId', postController.getUserPosts);

module.exports = router;