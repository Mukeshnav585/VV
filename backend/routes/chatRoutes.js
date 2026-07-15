const express = require('express');
const { getOrCreateChat, getMyChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyChats);
router.post('/', getOrCreateChat);

module.exports = router;
