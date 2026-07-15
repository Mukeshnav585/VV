const express = require('express');
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllChats,
  deleteMessage,
  getChatMessages,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

// Both middlewares required on all admin routes
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/chats', getAllChats);
router.get('/chats/:chatId/messages', getChatMessages);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
