# WhatsApp Backend Server

A real-time chat backend application built with Express.js, MongoDB, and Socket.io. Supports messaging, image sharing, and real-time user presence.

## Features

- **Real-time Messaging**: Instant message delivery using WebSocket (Socket.io)
- **User Management**: User registration, authentication via Google OAuth (JWT)
- **Conversations**: Create and manage direct conversations between users
- **Image Sharing**: Upload and retrieve images with GridFS storage
- **Incognito Mode**: Toggle private conversations between participants
- **User Presence**: Track online/offline user status

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Real-time Communication**: Socket.io
- **File Storage**: GridFS (MongoDB)
- **Authentication**: Google OAuth 2.0 (JWT tokens)
- **File Upload**: Multer

## Project Structure

```
├── index.js                    # Main server file with Socket.io setup
├── package.json               # Dependencies and scripts
├── routes/
│   └── route.js              # API endpoints
├── controller/
│   ├── user-controller.js     # User management logic
│   ├── conversation-controller.js
│   ├── message-controller.js
│   └── image-controller.js
├── modal/
│   ├── User.js               # User schema
│   ├── Message.js            # Message schema
│   └── Conversation.js       # Conversation schema
├── database/
│   └── db.js                 # MongoDB connection
└── middleware/
    └── upload.js             # Multer file upload config
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Google OAuth 2.0 credentials

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
DB_USERNAME=your_mongo_username
DB_PASSWORD=your_mongo_password
DB_CLUSTER=your_cluster_name

# OR use direct URI (takes priority)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# DNS Servers (optional)
DNS_SERVERS=8.8.8.8,8.8.4.4

# Server Port
PORT=8000
```

### 3. Run Server

**Development** (with auto-reload):
```bash
npm start
```

**Production**:
```bash
node index.js
```

## API Endpoints

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add` | Create/Register new user |
| GET | `/users` | Get all users |
| PATCH | `/user/status` | Update user online/offline status |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/conversation/add` | Create new conversation |
| POST | `/conversation/get` | Get specific conversation |
| GET | `/conversations/:userId` | Get all conversations for user |
| POST | `/conversation/clear/:id` | Clear conversation history |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message/add` | Send new message |
| GET | `/message/get/:id` | Get messages for conversation |
| PATCH | `/message/read` | Mark messages as read |

### File Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/file/upload` | Upload image/file |
| GET | `/file/:filename` | Retrieve file |

## Socket.io Events

### Client → Server
```javascript
socket.emit('addUser', userData)              // Register connected user
socket.emit('sendMessage', messageData)       // Send real-time message
socket.emit('setIncognito', {senderId, receiverId, isIncognito})
socket.emit('getIncognitoState', {senderId, receiverId})
```

### Server → Client
```javascript
socket.on('getMessage', messageData)          // Receive message
socket.on('getUsers', userList)               // Updated user list
socket.on('incognitoUpdated', incognitoData)  // Incognito status change
```

## Deployment Checklist

Before deploying to production:

- [ ] Verify `.env` variables are set correctly on hosting platform
- [ ] Ensure MongoDB Atlas IP whitelist includes server IP
- [ ] Update `allowedOrigins` CORS array with production frontend URL
- [ ] Run `npm install --production` to install only production dependencies
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB connection pooling
- [ ] Configure proper error logging and monitoring
- [ ] Use PM2 or similar process manager for production
- [ ] Implement rate limiting on API endpoints
- [ ] Add input validation and sanitization
- [ ] Keep Socket.io incognitoConversations in-memory or move to Redis for scaling

## Example Usage

### Send Message via REST API
```bash
POST /message/add
{
  "conversationId": "conv_123",
  "senderId": "user_1",
  "receiverId": "user_2",
  "text": "Hello!",
  "type": "text"
}
```

### Real-time Message via Socket.io
```javascript
socket.emit('sendMessage', {
  conversationId: 'conv_123',
  senderId: 'user_1',
  receiverId: 'user_2',
  text: 'Hello!',
  type: 'text'
});
```
