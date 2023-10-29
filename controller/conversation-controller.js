const Conversation = require("../modal/Conversation")

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

const clearConversation = async (req, res) => {
    try {
        const senderId = req.body.senderId;
        const receiverId = req.body.receiverId;

        await Conversation.findOneAndDelete({
            members: { $all: [senderId, receiverId] }
        });
        
        res.status(200).json({ message: 'Conversation cleared successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { newConversation, getConversation, clearConversation }