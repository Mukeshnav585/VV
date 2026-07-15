const express = require('express');
const { getMessages, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:chatId', getMessages);
router.patch('/:chatId/read', markAsRead);

module.exports = router;
