const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromSkill: {
    type: String,
    required: [true, 'Please specify the skill you want to teach'],
    trim: true
  },
  toSkill: {
    type: String,
    required: [true, 'Please specify the skill you want to learn'],
    trim: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  respondedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
swapRequestSchema.index({ from: 1, to: 1 });
swapRequestSchema.index({ status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);