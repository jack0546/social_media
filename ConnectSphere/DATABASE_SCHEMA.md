# ConnectSphere Database Schema

## Collections Structure

### users
```javascript
{
  uid: string,
  email: string,
  username: string,
  displayName: string,
  photoURL: string,
  bio: string,
  phoneNumber: string,
  isOnline: boolean,
  lastSeen: timestamp,
  isVerified: boolean,
  role: "user" | "admin",
  followers: string[], // array of user IDs
  following: string[], // array of user IDs
  blockedUsers: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### chats
```javascript
{
  id: string,
  participants: string[], // array of user IDs
  isGroup: boolean,
  groupName: string,
  groupPhoto: string,
  admins: string[], // for group chats
  lastMessage: string,
  lastMessageTime: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### messages
```javascript
{
  id: string,
  chatId: string,
  senderId: string,
  text: string,
  type: "text" | "image" | "video" | "audio" | "file",
  attachments: string[], // URLs
  replyTo: string, // message ID
  reactions: { [userId]: emoji },
  readBy: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### calls
```javascript
{
  id: string,
  type: "audio" | "video",
  callerId: string,
  calleeId: string,
  status: "ringing" | "answered" | "rejected" | "ended",
  offer: object,
  answer: object,
  duration: number, // seconds
  startedAt: timestamp,
  endedAt: timestamp,
  createdAt: timestamp
}
```

### notifications
```javascript
{
  id: string,
  userId: string,
  type: "message" | "call" | "like" | "comment" | "follow" | "mention",
  data: object,
  read: boolean,
  createdAt: timestamp
}
```

### posts
```javascript
{
  id: string,
  userId: string,
  text: string,
  media: string[],
  location: { lat: number, lng: number },
  hashtags: string[],
  mentions: string[],
  likes: string[],
  comments: string[],
  shares: number,
  bookmarkedBy: string[],
  sharedPost: object, // if reshared
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### comments
```javascript
{
  id: string,
  postId: string,
  userId: string,
  text: string,
  replyTo: string,
  likes: string[],
  createdAt: timestamp
}
```

### stories
```javascript
{
  id: string,
  userId: string,
  media: string[],
  caption: string,
  viewers: string[],
  expiresAt: timestamp,
  createdAt: timestamp
}
```

### friends
```javascript
{
  id: string,
  userId: string,
  friendId: string,
  status: "pending" | "accepted" | "blocked",
  createdAt: timestamp
}
```

### reports
```javascript
{
  id: string,
  reporterId: string,
  reportedId: string,
  type: "user" | "post" | "message",
  reason: string,
  details: string,
  status: "pending" | "resolved" | "dismissed",
  createdAt: timestamp
}
```

### settings
```javascript
{
  id: string,
  userId: string,
  notifications: {
    messages: boolean,
    calls: boolean,
    likes: boolean,
    comments: boolean,
    follows: boolean
  },
  privacy: {
    profileVisibility: "public" | "friends" | "private",
    messageRequests: "everyone" | "friends" | "none"
  },
  theme: "light" | "dark" | "system"
}
```

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // Block users collection
      match /blocked/{blockedUserId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null 
        && request.auth.uid in resource.data.participants;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/chats/$(resource.data.chatId))
          .data.participants.hasAny([request.auth.uid]);
    }
    
    // Posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```