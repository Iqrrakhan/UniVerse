const Message = require('../models/Message');

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;
    const conversationId = [myId, userId].sort().join('_');

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all conversations for current user
exports.getMyConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    })
      .populate('sender', 'name storeName')
      .populate('receiver', 'name storeName')
      .sort({ createdAt: -1 });

    // Get unique conversations with last message
    const seen = new Set();
    const conversations = messages.filter(m => {
      const otherId = m.sender._id.toString() === myId ? m.receiver._id.toString() : m.sender._id.toString();
      if (seen.has(otherId)) return false;
      seen.add(otherId);
      return true;
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};