const User = require('../models/User');

// @desc    Get all users with optional filters
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const { search, skill, college } = req.query;
    
    let query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by skill to teach
    if (skill) {
      query['skillsToTeach.skill'] = { $regex: skill, $options: 'i' };
    }
    
    // Filter by college
    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
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

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
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

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Own profile only)
exports.updateUser = async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    const { name, bio, college, avatar, skillsToTeach, skillsToLearn } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (college !== undefined) updateFields.college = college;
    if (avatar) updateFields.avatar = avatar;
    if (skillsToTeach) updateFields.skillsToTeach = skillsToTeach;
    if (skillsToLearn) updateFields.skillsToLearn = skillsToLearn;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
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

// @desc    Add skill to teach
// @route   POST /api/users/:id/skills/teach
// @access  Private
exports.addSkillToTeach = async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    const { skill, level } = req.body;
    
    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a skill'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if skill already exists
    const skillExists = user.skillsToTeach.some(s => s.skill.toLowerCase() === skill.toLowerCase());
    
    if (skillExists) {
      return res.status(400).json({
        success: false,
        message: 'Skill already added'
      });
    }
    
    user.skillsToTeach.push({
      skill,
      level: level || 'Intermediate'
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      user
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

// @desc    Add skill to learn
// @route   POST /api/users/:id/skills/learn
// @access  Private
exports.addSkillToLearn = async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    const { skill } = req.body;
    
    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a skill'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if skill already exists
    const skillExists = user.skillsToLearn.some(s => s.toLowerCase() === skill.toLowerCase());
    
    if (skillExists) {
      return res.status(400).json({
        success: false,
        message: 'Skill already added'
      });
    }
    
    user.skillsToLearn.push(skill);
    await user.save();
    
    res.status(200).json({
      success: true,
      user
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

// @desc    Search users by skills
// @route   GET /api/users/search
// @access  Private
exports.searchUsersBySkills = async (req, res) => {
  try {
    const { skillToLearn, skillToTeach } = req.query;
    
    if (!skillToLearn && !skillToTeach) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a skill to search'
      });
    }
    
    let query = {};
    
    // Find users who teach what I want to learn
    if (skillToLearn) {
      query['skillsToTeach.skill'] = { $regex: skillToLearn, $options: 'i' };
    }
    
    // Find users who want to learn what I teach
    if (skillToTeach) {
      query['skillsToLearn'] = { $regex: skillToTeach, $options: 'i' };
    }
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
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

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is deleting their own account
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this account'
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
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
// @desc    Remove skill to teach
// @route   DELETE /api/users/:id/skills/teach/:skillId
// @access  Private
exports.removeSkillToTeach = async (req, res) => {
  try {
    const { id, skillId } = req.params;

    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove the skill
    user.skillsToTeach = user.skillsToTeach.filter(
      skill => skill._id.toString() !== skillId
    );

    await user.save();

    res.status(200).json({
      success: true,
      user
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

// @desc    Remove skill to learn
// @route   DELETE /api/users/:id/skills/learn/:index
// @access  Private
exports.removeSkillToLearn = async (req, res) => {
  try {
    const { id, index } = req.params;

    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove the skill by index
    user.skillsToLearn.splice(parseInt(index), 1);

    await user.save();

    res.status(200).json({
      success: true,
      user
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