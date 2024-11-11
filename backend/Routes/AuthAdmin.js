const Admin = require('../Models/Admin');

const isAdmin = async (req, res, next) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in.' });
    }

    const adminExists = await Admin.exists({ _id: req.user._id });

    if (adminExists) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden: Admins only.' });
    }
  } catch (error) {
    console.error('Error verifying admin status:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = isAdmin;