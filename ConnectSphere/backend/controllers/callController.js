const { admin } = require('../firebaseConfig');
const { db } = admin;

// Initiate call
exports.initiateCall = async (req, res) => {
  try {
    const { type, calleeId, offer } = req.body;
    const callerId = req.user.uid;
    
    const callRef = await db.collection('calls').add({
      type,
      callerId,
      calleeId,
      status: 'ringing',
      offer,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      startedAt: null,
      endedAt: null,
      duration: 0
    });
    
    res.status(201).json({ callId: callRef.id });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Answer call
exports.answerCall = async (req, res) => {
  try {
    const { callId, answer } = req.body;
    const userId = req.user.uid;
    
    await db.collection('calls').doc(callId).update({
      status: 'answered',
      answer,
      startedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Call answered' });
  } catch (error) {
    console.error('Answer call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject call
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const { reason } = req.body;
    
    await db.collection('calls').doc(callId).update({
      status: 'rejected',
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectReason: reason || 'user_rejected'
    });
    
    res.json({ message: 'Call rejected' });
  } catch (error) {
    console.error('Reject call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// End call
exports.endCall = async (req, res) => {
  try {
    const { callId, duration } = req.body;
    
    await db.collection('calls').doc(callId).update({
      status: 'ended',
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
      duration
    });
    
    res.json({ message: 'Call ended' });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get call history
exports.getCallHistory = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const currentUserId = req.user.uid;
    
    const callsSnapshot = await db.collection('calls')
      .where('callerId', '==', currentUserId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const calls = [];
    for (const doc of callsSnapshot.docs) {
      const callData = doc.data();
      const otherUserId = callData.calleeId;
      const userDoc = await db.collection('users').doc(otherUserId).get();
      
      calls.push({
        id: doc.id,
        ...callData,
        otherUser: userDoc.exists ? userDoc.data() : null
      });
    }
    
    res.json({ calls });
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};