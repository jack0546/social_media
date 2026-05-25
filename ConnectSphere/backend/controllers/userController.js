const { admin } = require('../firebaseConfig');
const { db, auth } = admin;

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = userDoc.data();
    // Remove sensitive data
    const { password, ...user } = userData;
    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, bio, photoURL } = req.body;
    await db.collection('users').doc(userId).update({
      username: username || '',
      bio: bio || '',
      photoURL: photoURL || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOnlineUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').where('online', '==', true).get();
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      // Remove sensitive data
      const { password, ...user } = data;
      users.push({ id: doc.id, ...user });
    });
    res.json({ users });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    // Case-insensitive search on username
    const usersSnapshot = await db.collection('users')
      .where('username', '>=', query)
      .where('username', '<=', query + '\uf8ff')
      .limit(10)
      .get();
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      // Remove sensitive data
      const { password, ...user } = data;
      users.push({ id: doc.id, ...user });
    });
    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};