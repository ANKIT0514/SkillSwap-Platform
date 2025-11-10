const express = require('express');
const router = express.Router();
const {
  accessChat,
  getChats,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/')
  .get(getChats)
  .post(accessChat);

router.route('/:chatId')
  .delete(deleteChat);

router.route('/:chatId/messages')
  .get(getMessages)
  .post(sendMessage);

router.put('/:chatId/messages/read', markMessagesAsRead);

module.exports = router;