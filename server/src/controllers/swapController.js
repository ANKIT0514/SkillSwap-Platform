const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @desc    Create a new swap request
// @route   POST /api/swaps
// @access  Private
exports.createSwapRequest = async (req, res) => {
  try {
    const { to, fromSkill, toSkill, message } = req.body;

    // Validate required fields
    if (!to || !fromSkill || !toSkill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if trying to send request to self
    if (req.user.id === to) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send swap request to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    // Check if a pending request already exists
    const existingRequest = await SwapRequest.findOne({
      from: req.user.id,
      to: to,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this user'
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      from: req.user.id,
      to,
      fromSkill,
      toSkill,
      message
    });

    // Populate user details
    await swapRequest.populate('from', 'name email avatar');
    await swapRequest.populate('to', 'name email avatar');

    res.status(201).json({
      success: true,
      swapRequest
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

// @desc    Get all swap requests for current user
// @route   GET /api/swaps
// @access  Private
exports.getSwapRequests = async (req, res) => {
  try {
    const { type, status } = req.query;

    let query = {};

    // Filter by type (sent or received)
    if (type === 'sent') {
      query.from = req.user.id;
    } else if (type === 'received') {
      query.to = req.user.id;
    } else {
      // Get both sent and received
      query.$or = [
        { from: req.user.id },
        { to: req.user.id }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('from', 'name email avatar college')
      .populate('to', 'name email avatar college')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: swapRequests.length,
      swapRequests
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

// @desc    Get single swap request by ID
// @route   GET /api/swaps/:id
// @access  Private
exports.getSwapRequestById = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('from', 'name email avatar college skillsToTeach')
      .populate('to', 'name email avatar college skillsToTeach');

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is part of this swap
    if (
      swapRequest.from._id.toString() !== req.user.id &&
      swapRequest.to._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this swap request'
      });
    }

    res.status(200).json({
      success: true,
      swapRequest
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

// @desc    Update swap request status (accept/reject)
// @route   PUT /api/swaps/:id
// @access  Private
exports.updateSwapRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Only recipient can accept/reject, both can mark as completed
    if (status === 'accepted' || status === 'rejected') {
      if (swapRequest.to.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Only the recipient can accept or reject requests'
        });
      }
    }

    if (status === 'completed') {
      if (
        swapRequest.from.toString() !== req.user.id &&
        swapRequest.to.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this request'
        });
      }
    }

    // Update status
    swapRequest.status = status;

    if (status === 'accepted' || status === 'rejected') {
      swapRequest.respondedAt = Date.now();
    }

    if (status === 'completed') {
      swapRequest.completedAt = Date.now();
    }

    await swapRequest.save();

    await swapRequest.populate('from', 'name email avatar');
    await swapRequest.populate('to', 'name email avatar');

    res.status(200).json({
      success: true,
      swapRequest
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

// @desc    Delete swap request
// @route   DELETE /api/swaps/:id
// @access  Private
exports.deleteSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Only the sender can delete the request
    if (swapRequest.from.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can delete this request'
      });
    }

    await swapRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Swap request deleted successfully'
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