const Chat = require('../models/Chat');
const User = require('../models/User');

// Generate deterministic chatId from two user IDs
const makeChatId = (id1, id2) => [id1, id2].sort().join('_');

// @desc    Get or create a chat between two users
// @route   POST /api/chats
// @access  Private
const getOrCreateChat = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const chatId = makeChatId(req.user._id.toString(), receiverId);

    let chat = await Chat.findOne({ chatId }).populate(
      'members',
      'name email isOnline lastSeen avatar'
    );

    if (!chat) {
      chat = await Chat.create({
        chatId,
        members: [req.user._id, receiverId],
      });
      chat = await Chat.findById(chat._id).populate(
        'members',
        'name email isOnline lastSeen avatar'
      );
    }

    res.json({ chat });
  } catch (err) {
    console.error('Get/create chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate('members', 'name email isOnline lastSeen avatar')
      .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getOrCreateChat, getMyChats, makeChatId };
