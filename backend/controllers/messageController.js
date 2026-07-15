const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Get messages for a chat (paginated)
// @route   GET /api/messages/:chatId?page=1&limit=50
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is a member of this chat
    const [u1, u2] = chatId.split('_');
    const userId = req.user._id.toString();
    if (userId !== u1 && userId !== u2) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name avatar')
      .lean();

    // Return oldest-first for the client
    messages.reverse();

    const total = await Message.countDocuments({ chatId });

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PATCH /api/messages/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { chatId, receiverId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages, markAsRead };
