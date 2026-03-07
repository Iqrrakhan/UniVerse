const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next(); // ✅ return added
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' }); // ✅ return added
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' }); // ✅ return added
  }
};

module.exports = { protect };