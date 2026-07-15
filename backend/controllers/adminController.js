const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
  try {
    const [totalUsers, onlineUsers, totalMessages, totalChats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

    // Top 5 most active senders
    const topUsers = await Message.aggregate([
      { $group: { _id: '$senderId', messageCount: { $sum: 1 } } },
      { $sort: { messageCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          messageCount: 1,
          'user.name': 1,
          'user.email': 1,
        },
      },
    ]);

    res.json({ totalUsers, onlineUsers, totalMessages, totalChats, topUsers });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role isOnline lastSeen createdAt')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a user (and their messages)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Message.deleteMany({ $or: [{ senderId: req.params.id }, { receiverId: req.params.id }] }),
      Chat.deleteMany({ members: req.params.id }),
    ]);

    res.json({ message: 'User and associated data deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all chats
// @route   GET /api/admin/chats
// @access  Admin
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('members', 'name email')
      .sort({ lastMessageAt: -1 });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/admin/messages/:id
// @access  Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages in a chat (admin view)
// @route   GET /api/admin/chats/:chatId/messages
// @access  Admin
const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getAllUsers, deleteUser, getAllChats, deleteMessage, getChatMessages };
