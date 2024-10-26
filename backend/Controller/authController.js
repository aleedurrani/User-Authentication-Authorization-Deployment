const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../Models/User')

const generateToken = (user) => {
  const payload = {
    _id: user._id,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

let RegisterUser = async (req, res) => {
  try {

    const existingUser = await User.findOne({ Email: req.body.Email });
    
    if (existingUser) {
      return res.status(400).json({ message: "You already have an account. Please Login" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.Password, salt);
    const newUser = new Student({
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Email: req.body.Email,
      Password: hashedPass,
      Age: req.body.Age
    });

    const user = await User.create(newUser);

    const token = generateToken(user);
    
    res.status(200).json({
      token,  // JWT token
      user: {
        _id: user._id,       // Return user ID
        FullName: user.FirstName + " " + user.LastName  // Return full name
      }
    });

  } catch (err) {
    res.status(500).json(err);
  }
};


let LoginUser = async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.body.Email });

    if (!user) {
      // If user is not found, return an appropriate response
      return res.status(400).json("Wrong credentials!");
    }

    const validated = await bcrypt.compare(req.body.Password, user.Password);

    if (!validated) {
      // If password is incorrect, return an appropriate response
      return res.status(400).json("Wrong credentials!");
    }

    const token = generateToken(user);

    

    res.status(200).json({
      token,  // JWT token
      user: {
        _id: user._id,       // Return user ID
        FullName: user.FirstName + " " + user.LastName  // Return full name
      }
    });


  } catch (err) {
    // Handle other errors, e.g., database connection issues
    console.error(err);
    res.status(500).json("Internal server error happens");
  }
};


module.exports = { RegisterUser, LoginUser}