const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const Route = require('./routes/route');
const Connection = require('./database/db');

dotenv.config();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', Route);

Connection(username, password);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'https://whatsapp-frontend-mu.vercel.app/',
    },
});

let users = [];

const addUser = (userData, socketId) => {
    !users.some(user => user.sub === userData.sub) && users.push({ ...userData, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user.sub === userId);
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

    // Toggle incognito mode
    socket.on('setIncognito', (data, incognitoState) => {
        const newIncognitoState = incognitoState;
        const user = getUser(data.receiverId);
        if (user) {
            io.to(user.socketId).emit('getIncognito', newIncognitoState);
        }
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
