const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

module.exports = (io) => {
  // userId → socketId mapping (in-memory; use Redis for multi-instance)
  const onlineUsers = new Map();

  // --- JWT authentication middleware for every socket ---
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId} (socket: ${socket.id})`);

    // --- Mark user as online ---
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Broadcast updated online users list to ALL clients
    io.emit('update_online_users', [...onlineUsers.keys()]);

    // --- Join a private chat room ---
    socket.on('join_chat', (chatId) => {
      // Validate: this user must be part of the chatId
      const parts = chatId.split('_');
      if (parts.length !== 2 || !parts.includes(userId)) {
        socket.emit('error', { message: 'Unauthorized: Cannot join this chat' });
        return;
      }
      socket.join(chatId);
      console.log(`💬 User ${userId} joined chat room: ${chatId}`);
    });

    // --- Leave a chat room ---
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
    });

    // --- Send a message ---
    socket.on('send_message', async (data) => {
      try {
        const { chatId, receiverId, text } = data;

        // Validate inputs
        if (!chatId || !receiverId || !text || !text.trim()) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        if (text.trim().length > 2000) {
          socket.emit('error', { message: 'Message too long (max 2000 chars)' });
          return;
        }

        // Validate: sender must be part of chatId
        const parts = chatId.split('_');
        if (parts.length !== 2 || !parts.includes(userId)) {
          socket.emit('error', { message: 'Unauthorized: Not a member of this chat' });
          return;
        }

        // Validate receiver is the other member
        if (!parts.includes(receiverId)) {
          socket.emit('error', { message: 'Unauthorized: Invalid receiver' });
          return;
        }

        // Save to MongoDB
        const message = await Message.create({
          chatId,
          senderId: userId,
          receiverId,
          text: text.trim(),
        });

        // Update chat's last message
        await Chat.findOneAndUpdate(
          { chatId },
          { lastMessage: text.trim(), lastMessageAt: new Date() }
        );

        // Populate sender info for the response
        const populated = await Message.findById(message._id)
          .populate('senderId', 'name avatar')
          .lean();

        // Emit to everyone in the room (both sender and receiver)
        io.to(chatId).emit('receive_message', populated);

        // If receiver is online but not in this room, emit to their socket directly
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          const rooms = receiverSocket ? [...receiverSocket.rooms] : [];
          if (!rooms.includes(chatId)) {
            io.to(receiverSocketId).emit('new_message_notification', {
              chatId,
              senderId: userId,
              senderName: socket.user.name,
              text: text.trim(),
            });
          }
        }
      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // --- Typing indicators ---
    socket.on('typing_start', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', { userId, chatId });
    });

    socket.on('typing_stop', ({ chatId }) => {
      socket.to(chatId).emit('user_stopped_typing', { userId, chatId });
    });

    // --- Disconnect ---
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${userId}`);
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Broadcast updated online users list
      io.emit('update_online_users', [...onlineUsers.keys()]);
    });
  });
};
