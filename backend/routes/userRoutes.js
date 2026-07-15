const express = require('express');
const { getAllUsers, searchUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All user routes require auth

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);

module.exports = router;
