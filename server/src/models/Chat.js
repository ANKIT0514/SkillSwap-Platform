const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only 2 participants
chatSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('A chat must have exactly 2 participants'));
  }
  next();
});

// Index for faster queries
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);