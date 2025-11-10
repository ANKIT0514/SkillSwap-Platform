const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get or create a chat between two users
// @route   POST /api/chats
// @access  Private
exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, userId] }
    })
      .populate('participants', 'name email avatar')
      .populate('lastMessageSender', 'name');

    if (chat) {
      return res.status(200).json({
        success: true,
        chat
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.user.id, userId]
    });

    chat = await Chat.findById(chat._id)
      .populate('participants', 'name email avatar')
      .populate('lastMessageSender', 'name');

    res.status(201).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
      .populate('participants', 'name email avatar')
      .populate('lastMessageSender', 'name')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Get messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Create message
    let message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      content: content.trim()
    });

    // Update chat's last message
    chat.lastMessage = content.trim().substring(0, 100);
    chat.lastMessageTime = Date.now();
    chat.lastMessageSender = req.user.id;
    await chat.save();

    // Populate sender info
    message = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:chatId/messages/read
// @access  Private
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user.id },
        read: false
      },
      {
        read: true,
        readAt: Date.now()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a chat
// @route   DELETE /api/chats/:chatId
// @access  Private
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    // Delete all messages in this chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};