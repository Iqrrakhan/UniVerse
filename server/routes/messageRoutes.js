const express = require('express');
const router = express.Router();
const { getConversation, getMyConversations, getUnreadCount, getUserChatProfile } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getMyConversations);
router.get('/unread-count', protect, getUnreadCount);
router.get('/conversation/:userId', protect, getConversation);
router.get('/user/:userId', protect, getUserChatProfile);

module.exports = router;