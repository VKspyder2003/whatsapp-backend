const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const Route = require('./routes/route');
const { Connection } = require('./database/db');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://whatsapp-frontend-mu.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', Route);

Connection();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
    },
});

let users = [];
const incognitoConversations = new Map();

const addUser = (userData, socketId) => {
    !users.some(user => user.sub === userData.sub) && users.push({ ...userData, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user.sub === userId);
}

const getConversationKey = (senderId, receiverId) => {
    return [senderId, receiverId].sort().join(':');
}

const emitToParticipants = (participantIds, event, payload) => {
    participantIds.forEach((participantId) => {
        const user = getUser(participantId);

        if (user?.socketId) {
            io.to(user.socketId).emit(event, payload);
        }
    });
}

io.on('connection', (socket) => {
    console.log('user connected');

    // Connect
    socket.on('addUser', (userData) => {
        addUser(userData, socket.id);
        io.emit('getUsers', users);
    });

    // Send message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);
        if (user)
            io.to(user.socketId).emit('getMessage', data)
    })

    socket.on('getIncognitoState', ({ senderId, receiverId }) => {
        if (!senderId || !receiverId) return;

        const participants = [senderId, receiverId];
        const key = getConversationKey(senderId, receiverId);

        socket.emit('incognitoUpdated', {
            participants,
            isIncognito: Boolean(incognitoConversations.get(key))
        });
    });

    // Toggle incognito mode for both participants.
    socket.on('setIncognito', ({ senderId, receiverId, isIncognito }) => {
        if (!senderId || !receiverId) return;

        const participants = [senderId, receiverId];
        const key = getConversationKey(senderId, receiverId);
        const nextIncognitoState = Boolean(isIncognito);

        if (nextIncognitoState) {
            incognitoConversations.set(key, true);
        } else {
            incognitoConversations.delete(key);
        }

        emitToParticipants(participants, 'incognitoUpdated', {
            participants,
            isIncognito: nextIncognitoState,
            changedBy: senderId
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`HTTP and WebSocket servers are running on port ${PORT}`);
});
