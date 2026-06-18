const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Grab the token straight from the HttpOnly cookie store
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // 2. Verify the extracted token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 3. Fetch user info without returning the sensitive password hash
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found, unauthorized'
      });
    }

    // 4. Proceed seamlessly to the controller
    next();

  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = { protect };