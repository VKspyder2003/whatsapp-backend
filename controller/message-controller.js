const Message = require('../modal/Message')
const Conversation = require('../modal/Conversation')

const newMessage = async (request, response) => {
    if (request.body.isIncognito) {
        response.status(200).json({
            ...request.body,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return;
    }

    const newMessage = new Message(request.body);
    try {
        const savedMessage = await newMessage.save();
        await Conversation.findByIdAndUpdate(request.body.conversationId, {
            message: request.body.text,
            updatedAt: new Date()
        });
        response.status(200).json(savedMessage);
    } catch (error) {
        response.status(500).json(error);
    }
}

const getMessage = async (request, response) => {
    try {
        const messages = await Message.find({ conversationId: request.params.id }).sort({ createdAt: 1 });
        response.status(200).json(messages);
    } catch (error) {
        response.status(500).json(error);
    }

}

const markMessagesRead = async (request, response) => {
    try {
        const { conversationId, receiverId } = request.body;

        if (!conversationId || !receiverId) {
            response.status(400).json({ message: 'conversationId and receiverId are required.' });
            return;
        }

        const result = await Message.updateMany(
            { conversationId, receiverId, read: { $ne: true } },
            { read: true }
        );

        response.status(200).json({ modifiedCount: result.modifiedCount || 0 });
    } catch (error) {
        response.status(500).json(error);
    }
}

module.exports = { newMessage, getMessage, markMessagesRead }
