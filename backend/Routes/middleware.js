const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json("Access denied");

    let decoded;
    decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { _id, role } = decoded;

    res.locals.userId = _id;
    res.locals.userrole = role;
   
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token error in verifyToken middleware:', error);
      return res.status(401).json('Invalid token');
    } else {
      console.error('Error in verifyToken middleware:', error);
      return res.status(500).json('Internal Server Error');
    }
  }
};

module.exports = verifyToken;