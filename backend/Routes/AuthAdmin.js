const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const AuthAdmin = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json('Access denied. No token provided.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json('Access denied. Not an admin.');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('AuthAdmin middleware error:', error);
    res.status(400).json('Invalid token.');
  }
};

module.exports = AuthAdmin;