const jwt = require('jsonwebtoken');
const { admin } = require('../firebaseConfig');

exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    try {
      // Verify Firebase ID token
      const decoded = await admin.auth().verifyIdToken(token);
      const userRecord = await admin.auth().getUser(decoded.uid);
      req.user = {
        uid: userRecord.uid,
        email: userRecord.email,
        ...decoded
      };
      next();
    } catch (error) {
      // Try JWT fallback
      const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = jwtDecoded;
      next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};