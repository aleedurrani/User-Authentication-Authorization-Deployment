const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");

const AuthAdmin = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json("Access denied. No token provided.");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(403).json("Access denied. Not an admin.");
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("AuthAdmin middleware error:", error);
    res.status(400).json("Invalid token.");
  }
};

module.exports = AuthAdmin;