const { admin } = require('../firebaseConfig');
const { db } = admin;

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    
    const usersSnapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(offset)
      .get();
    
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      const { password, ...user } = data;
      return { id: doc.id, ...user };
    });
    
    const totalSnapshot = await db.collection('users').get();
    
    res.json({ users, total: totalSnapshot.size });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ban user
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;
    
    await db.collection('users').doc(userId).update({
      banned: true,
      banReason: reason,
      banExpires: duration ? admin.firestore.Timestamp.fromDate(new Date(Date.now() + duration)) : null
    });
    
    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unban user
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await db.collection('users').doc(userId).update({
      banned: false,
      banReason: null,
      banExpires: null
    });
    
    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const postsSnapshot = await db.collection('posts').get();
    const chatsSnapshot = await db.collection('chats').get();
    const messagesSnapshot = await db.collection('messages').get();
    
    res.json({
      totalUsers: usersSnapshot.size,
      totalPosts: postsSnapshot.size,
      totalChats: chatsSnapshot.size,
      totalMessages: messagesSnapshot.size
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const reportsSnapshot = await db.collection('reports')
      .orderBy('createdAt', 'desc')
      .get();
    
    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};