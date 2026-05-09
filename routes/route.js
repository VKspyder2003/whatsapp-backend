const express = require('express')
const { addUser, getUser, updateUserStatus } = require('../controller/user-controller.js')
const { newConversation, getConversation, getUserConversations, clearConversation } = require('../controller/conversation-controller.js');
const { newMessage, getMessage, markMessagesRead } = require('../controller/message-controller.js');

const { uploadImage, getImage } = require('../controller/image-controller.js');

const upload = require('../middleware/upload.js')

const route = express.Router()

route.post('/add', addUser);
route.get('/users', getUser);
route.patch('/user/status', updateUserStatus);

route.post('/conversation/add', newConversation);
route.post('/conversation/get', getConversation);
route.get('/conversations/:userId', getUserConversations);

route.post('/message/add', newMessage);
route.get('/message/get/:id', getMessage);
route.patch('/message/read', markMessagesRead);

route.post('/file/upload', upload.single('file'), uploadImage);
route.get('/file/:filename', getImage);

route.post('/conversation/clear/:id', clearConversation);

module.exports = route
