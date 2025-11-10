const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }

    // Get user from token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};