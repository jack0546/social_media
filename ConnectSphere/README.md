# ConnectSphere

A modern full-stack social media and chat application with real-time messaging, voice/video calls, and social features.

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io + Firebase Admin
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Socket.io + WebRTC
- **Storage**: Firebase Storage
- **Notifications**: Firebase Cloud Messaging
- **Deployment**: Vercel (frontend) + Render/Railway (backend)

## Features

### Authentication
- Email/password registration and login
- Google OAuth integration
- Phone authentication with OTP
- Password reset flow
- Email verification

### Social Features
- User profiles with avatars and bios
- Posts with media uploads
- Likes, comments, and shares
- Stories/status updates
- Hashtags and mentions

### Real-time Chat
- One-to-one and group chats
- Real-time messaging with Socket.io
- Typing indicators
- Read receipts
- Message reactions
- File/image sharing
- Voice messages

### Voice & Video Calls
- WebRTC-based voice calls
- WebRTC-based video calls
- Call notifications
- Mute/unmute microphone
- Camera on/off toggle

### Notifications
- Real-time push notifications
- In-app notification center
- Call and message alerts

## Project Structure

```
ConnectSphere/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── postController.js
│   │   ├── callController.js
│   │   └── notificationController.js
│   ├── routes/
│   ├── middleware/
│   ├── firebaseConfig.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── context/
    │   └── lib/
    ├── package.json
    └── tailwind.config.js
```

## Setup

### Backend Setup
```bash
cd ConnectSphere/backend
npm install
cp .env.example .env
# Fill in your Firebase credentials
npm run dev
```

### Frontend Setup
```bash
cd ConnectSphere/frontend
npm install
cp .env.example .env
# Fill in your Firebase config
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
# Firebase Admin SDK config
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Routes

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/phone` - Phone OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile/:userId` - Get profile
- `PUT /api/users/profile/:userId` - Update profile
- `GET /api/users/online` - Get online users
- `GET /api/users/search` - Search users

### Chats
- `POST /api/chats` - Create/get chat
- `GET /api/chats` - Get user chats
- `POST /api/chats/messages` - Send message
- `GET /api/chats/:chatId/messages` - Get messages

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed posts
- `POST /api/posts/like` - Toggle like

### Calls
- `POST /api/calls/initiate` - Start call
- `POST /api/calls/answer` - Answer call
- `POST /api/calls/reject` - Reject call
- `POST /api/calls/end` - End call
- `GET /api/calls/history` - Call history

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Render/Railway)
1. Create new web service
2. Set root directory to `/backend`
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

## License

MIT License