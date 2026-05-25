const { admin } = require('../firebaseConfig');
const { db } = admin;

// Create or get chat
exports.createOrGetChat = async (req, res) => {
  try {
    const { participants, isGroup, groupName, groupPhoto } = req.body;
    const currentUserId = req.user.uid;
    
    // For one-to-one chat, check if exists
    if (!isGroup) {
      const otherUser = participants.find(p => p !== currentUserId);
      const existingChat = await db.collection('chats')
        .where('participants', 'array-contains', currentUserId)
        .where('isGroup', '==', false)
        .get();
      
      for (const doc of existingChat.docs) {
        const chatData = doc.data();
        if (chatData.participants.includes(otherUser)) {
          return res.json({ chatId: doc.id, ...chatData });
        }
      }
    }
    
    // Create new chat
    const chatRef = await db.collection('chats').add({
      participants: isGroup ? participants : [...participants, currentUserId],
      isGroup: isGroup || false,
      groupName: isGroup ? groupName : null,
      groupPhoto: isGroup ? groupPhoto : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      admins: isGroup ? [currentUserId] : []
    });
    
    const chatDoc = await chatRef.get();
    res.status(201).json({ chatId: chatRef.id, ...chatDoc.data() });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's chats
exports.getUserChats = async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const chatsSnapshot = await db.collection('chats')
      .where('participants', 'array-contains', currentUserId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const chats = [];
    for (const doc of chatsSnapshot.docs) {
      const chatData = doc.data();
      // Get last message
      const lastMsg = await db.collection('messages')
        .where('chatId', '==', doc.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      chats.push({
        id: doc.id,
        ...chatData,
        lastMessage: lastMsg.empty ? null : lastMsg.docs[0].data()
      });
    }
    
    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text, type = 'text', replyTo, attachments } = req.body;
    const currentUserId = req.user.uid;
    
    const messageRef = await db.collection('messages').add({
      chatId,
      senderId: currentUserId,
      text: text || '',
      type,
      attachments: attachments || [],
      replyTo: replyTo || null,
      reactions: {},
      readBy: [currentUserId],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update chat last message
    await db.collection('chats').doc(chatId).update({
      lastMessage: text || (type !== 'text' ? type : ''),
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ messageId: messageRef.id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;
    const currentUserId = req.user.uid;
    
    let query = db.collection('messages')
      .where('chatId', '==', chatId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    if (before) {
      query = query.startAfter(before);
    }
    
    const messagesSnapshot = await query.get();
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
    
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const currentUserId = req.user.uid;
    
    const messagesSnapshot = await db.collection('messages')
      .where('chatId', '==', chatId)
      .where('senderId', '!=', currentUserId)
      .get();
    
    const batch = db.batch();
    messagesSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        readBy: admin.firestore.FieldValue.arrayUnion(currentUserId)
      });
    });
    
    await batch.commit();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add reaction to message
exports.addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const currentUserId = req.user.uid;
    
    await db.collection('messages').doc(messageId).update({
      [`reactions.${currentUserId}`]: emoji
    });
    
    res.json({ message: 'Reaction added' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};