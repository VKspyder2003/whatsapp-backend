const Conversation = require("../modal/Conversation")
const Message = require("../modal/Message")
const User = require("../modal/User")

const newConversation = async (req, res) => {
    const senderId = req.body.senderId
    const receiverId = req.body.receiverId

    const exist = await Conversation.findOne({ members: { $all: [receiverId, senderId] } })

    if (exist) {
        res.status(200).json('Conversation already exists');
        return;
    }
    const newConversation = new Conversation({
        members: [senderId, receiverId]
    });

    try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ members: { $all: [req.body.senderId, req.body.receiverId] } });
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json(error);
    }

}

const getUserConversations = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            res.status(400).json({ message: 'User id is required.' });
            return;
        }

        const conversations = await Conversation.find({ members: userId }).sort({ updatedAt: -1 });
        const otherUserIds = conversations
            .map((conversation) => conversation.members.find((member) => member !== userId))
            .filter(Boolean);
        const users = await User.find({ sub: { $in: otherUserIds } });
        const usersBySub = new Map(users.map((user) => [user.sub, user]));

        const conversationSummaries = await Promise.all(conversations.map(async (conversation) => {
            const otherUserId = conversation.members.find((member) => member !== userId);
            const lastMessage = await Message.findOne({ conversationId: conversation._id.toString() }).sort({ createdAt: -1 });
            const unreadCount = await Message.countDocuments({
                conversationId: conversation._id.toString(),
                receiverId: userId,
                read: { $ne: true }
            });

            return {
                conversation,
                user: usersBySub.get(otherUserId),
                lastMessage,
                unreadCount,
                updatedAt: lastMessage?.createdAt || conversation.updatedAt
            };
        }));

        res.status(200).json(
            conversationSummaries
                .filter((item) => item.user && item.lastMessage)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
    } catch (error) {
        res.status(500).json(error);
    }
}

const clearConversation = async (req, res) => {
    try {
        const conversationId = req.params.id;

        await Conversation.findByIdAndDelete(conversationId);
        
        res.status(200).json({ message: 'Conversation cleared successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { newConversation, getConversation, getUserConversations, clearConversation }
