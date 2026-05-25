const { admin } = require('../firebaseConfig');
const { db } = admin;

// Create post
exports.createPost = async (req, res) => {
  try {
    const { text, media, location, hashtags, mentions } = req.body;
    const currentUserId = req.user.uid;
    
    const postRef = await db.collection('posts').add({
      userId: currentUserId,
      text: text || '',
      media: media || [],
      location: location || null,
      hashtags: hashtags || [],
      mentions: mentions || [],
      likes: [],
      comments: [],
      shares: 0,
      bookmarkedBy: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ postId: postRef.id });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get posts for feed
exports.getFeedPosts = async (req, res) => {
  try {
    const { limit = 20, lastDoc } = req.query;
    const currentUserId = req.user.uid;
    
    // Get user's following list
    const userDoc = await db.collection('users').doc(currentUserId).get();
    const userData = userDoc.data();
    const following = userData?.following || [];
    
    let query = db.collection('posts')
      .where('userId', 'in', [...following, currentUserId].slice(0, 10))
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const postsSnapshot = await query.get();
    const posts = [];
    
    for (const doc of postsSnapshot.docs) {
      const postData = doc.data();
      const userDoc = await db.collection('users').doc(postData.userId).get();
      posts.push({
        id: doc.id,
        ...postData,
        user: userDoc.exists ? userDoc.data() : null
      });
    }
    
    res.json({ posts });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const currentUserId = req.user.uid;
    
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const postData = postDoc.data();
    const likes = postData.likes || [];
    const hasLiked = likes.includes(currentUserId);
    
    if (hasLiked) {
      await postRef.update({
        likes: admin.firestore.FieldValue.arrayRemove(currentUserId)
      });
    } else {
      await postRef.update({
        likes: admin.firestore.FieldValue.arrayUnion(currentUserId)
      });
    }
    
    res.json({ liked: !hasLiked });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { postId, text, replyTo } = req.body;
    const currentUserId = req.user.uid;
    
    const commentRef = await db.collection('comments').add({
      postId,
      userId: currentUserId,
      text,
      replyTo: replyTo || null,
      likes: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('posts').doc(postId).update({
      comments: admin.firestore.FieldValue.arrayUnion(commentRef.id)
    });
    
    res.status(201).json({ commentId: commentRef.id });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share post
exports.sharePost = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const currentUserId = req.user.uid;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const originalPost = postDoc.data();
    
    const shareRef = await db.collection('posts').add({
      userId: currentUserId,
      text: text || '',
      sharedPost: {
        postId,
        userId: originalPost.userId,
        text: originalPost.text,
        media: originalPost.media
      },
      likes: [],
      comments: [],
      shares: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ postId: shareRef.id });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    const postsSnapshot = await db.collection('posts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};