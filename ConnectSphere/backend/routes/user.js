const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile/:userId', userController.getUserProfile);
router.put('/profile/:userId', authMiddleware.protect, userController.updateUserProfile);
router.get('/online', authMiddleware.protect, userController.getOnlineUsers);
router.get('/search', authMiddleware.protect, userController.searchUsers);

// Friend system
router.post('/follow/:userId', authMiddleware.protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uid;
    
    const batch = db.batch();
    const currentUserRef = db.collection('users').doc(currentUserId);
    const targetUserRef = db.collection('users').doc(userId);
    
    batch.update(currentUserRef, {
      following: admin.firestore.FieldValue.arrayUnion(userId)
    });
    batch.update(targetUserRef, {
      followers: admin.firestore.FieldValue.arrayUnion(currentUserId)
    });
    
    await batch.commit();
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;