const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  addSkillToTeach,
  addSkillToLearn,
  searchUsersBySkills,
  deleteUser,
  removeSkillToTeach, 
  removeSkillToLearn
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Protect all routes
router.use(protect);

// User routes
router.get('/', getAllUsers);
router.get('/search', searchUsersBySkills);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Upload avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is updating their own avatar
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create the avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar in database
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      avatar: avatarUrl,
      user
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
});

// Skill routes
router.post('/:id/skills/teach', addSkillToTeach);
router.post('/:id/skills/learn', addSkillToLearn);
router.delete('/:id/skills/teach/:skillId', removeSkillToTeach);
router.delete('/:id/skills/learn/:index', removeSkillToLearn);

module.exports = router;