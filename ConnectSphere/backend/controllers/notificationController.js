const { admin } = require('../firebaseConfig');
const { db } = admin;

// Get notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const currentUserId = req.user.uid;
    
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', currentUserId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await db.collection('notifications').doc(notificationId).update({
      read: true
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create notification (helper for other controllers)
exports.createNotification = async (userId, type, data) => {
  try {
    const validTypes = ['message', 'call', 'like', 'comment', 'follow', 'mention'];
    if (!validTypes.includes(type)) return;
    
    await db.collection('notifications').add({
      userId,
      type,
      data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};