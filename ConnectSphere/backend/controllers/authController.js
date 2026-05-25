const admin = require('../firebaseConfig');
const { db, auth } = admin;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, username, phoneNumber } = req.body;

    // Check if user already exists
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    if (userRecord) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: username,
      phoneNumber: phoneNumber || undefined,
      disabled: false
    });

    // Hash password for additional security (optional, as Firebase already hashes)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document in Firestore
    await db.collection('users').doc(firebaseUser.uid).set({
      uid: firebaseUser.uid,
      email,
      username,
      phoneNumber: phoneNumber || '',
      photoURL: '',
      bio: '',
      online: false,
      lastSeen: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT
    const token = jwt.sign({ uid: firebaseUser.uid }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        uid: firebaseUser.uid,
        email,
        username,
        phoneNumber: phoneNumber || ''
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from Firebase Auth
    const userRecord = await auth.getUserByEmail(email);

    // Verify password (using bcrypt since we hashed it)
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(password, userData.hashedPassword || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Update online status
    await db.collection('users').doc(userRecord.uid).update({
      online: true,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
        photoURL: userRecord.photoURL
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google authentication
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = ticket;

    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      // Create new user
      await db.collection('users').doc(uid).set({
        uid,
        email,
        username: name,
        photoURL: picture || '',
        bio: '',
        online: false,
        lastSeen: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update last login
      await db.collection('users').doc(uid).update({
        lastSeen: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        uid,
        email,
        username: name,
        photoURL: picture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

// Phone authentication with OTP
exports.phoneAuth = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    // In a real app, you would use Firebase Auth to send OTP
    // For simplicity, we'll generate a fake OTP and return it
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store OTP in Firestore or cache (e.g., Redis) with expiration
    await db.collection('otp').doc(phoneNumber).set({
      otp,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)) // 10 minutes
    });

    // In production, you would send the OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Phone auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const otpDoc = await db.collection('otp').doc(phoneNumber).get();
    if (!otpDoc.exists) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    const otpData = otpDoc.data();
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if user exists, if not create
    const userSnapshot = await db.collection('users').where('phoneNumber', '==', phoneNumber).limit(1).get();
    let userId;
    if (userSnapshot.empty) {
      // Create new user with phone number
      const firebaseUser = await auth.createUser({
        phoneNumber,
        disabled: false
      });
      userId = firebaseUser.uid;
      await db.collection('users').doc(userId).set({
        uid: userId,
        phoneNumber,
        username: phoneNumber, // Temporary username
        photoURL: '',
        bio: '',
        online: false,
        lastSeen: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      userId = userSnapshot.docs[0].id;
    }

    // Generate JWT
    const token = jwt.sign({ uid: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Clear OTP
    await db.collection('otp').doc(phoneNumber).delete();

    res.json({
      message: 'Phone verification successful',
      token,
      user: {
        uid: userId,
        phoneNumber
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userRecord = await auth.getUserByEmail(email);
    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    // In production, send email via email service
    console.log(`Password reset link for ${email}: ${resetLink}`);
    res.json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { oobCode, newPassword } = req.body;
    await auth.confirmPasswordReset(oobCode, newPassword);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { oobCode } = req.body;
    await auth.verifyEmail(oobCode);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};