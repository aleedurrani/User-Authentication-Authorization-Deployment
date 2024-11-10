const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../Models/User')
const Request = require('../Models/Request')
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.Email });

    

    if (existingUser) {
      return res.status(400).json({ message: "You already have an account. Please login." });
    } 

    const existingRequest = await Request.findOne({ 
      requestType: 'signup', 
      'requestData.email': req.body.Email, 
      status: 'pending' 
    });
    if (existingRequest) {
      return res.status(403).json({ message: "A signup request is already pending for this email." });
    }

    if (req.body.Password && req.body.FirstName && req.body.LastName && req.body.Role) {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.Password, salt);
    // Create a new request entry
    const newRequest = new Request({
      requestType: 'signup',
      requestData: {
        email: req.body.Email,
        password: hashedPass,
        name: req.body.FirstName + " " + req.body.LastName,
        role: req.body.Role,
      },
        // Pass the role from the request
      status: 'pending',  
    });

    // Save the request to the database
    await newRequest.save();

 
    res.sendStatus(200);
  } else {
    return res.status(200).json({ message: "New user" });
  }

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


let RegisterUserGoogle = async (req, res) => {
  try {
    const randomPassword = crypto.randomBytes(8).toString('hex'); 
    const salt = await bcrypt.genSalt(10); 
    const hashedPass = await bcrypt.hash(randomPassword, salt); 
    // Create a new request entry

    const newRequest = new Request({
      requestType: 'signup',
      requestData: {
        email: req.body.Email,
        password: hashedPass,
        name: req.body.FirstName + " " + req.body.LastName,
        role: req.body.Role,
      },
        // Pass the role from the request
      status: 'pending',  
      googleId: req.body.GoogleId
    });

    // Save the request to the database
    await newRequest.save();

 
    res.sendStatus(200);
  

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


let VerifyEmail = async (req, res) => {
  try {
    
    const pin = crypto.randomInt(10000, 99999); // Generate a 6-digit PIN
   
    // Set up Nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.Email,
      subject: "Email Verification PIN",
      text: `Your email verification PIN is ${pin}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error); // Log the specific error
        return res.status(401).json({ message: "Error sending email", error: error.message });
      }
      res.status(200).json({ message: "PIN sent to your email", pin: pin });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};





let LoginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.Email });

    if (!user) {
      // If user is not found, return an appropriate response
      const existingRequest = await Request.findOne({ 
        requestType: 'signup', 
        'requestData.email': req.body.Email, 
        status: 'pending' 
      });
      if (existingRequest) {
        return res.status(403).json({ message: "A signup request is already pending for this email." });
      }
      else {
      return res.status(400).json("Wrong credentials!");
      }
    }

    

    const validated = await bcrypt.compare(req.body.Password, user.passwordHash);

    if (!validated) {
      // If password is incorrect, return an appropriate response
      return res.status(400).json("Wrong credentials!");
    }

    const token = generateToken(user);

    

    res.status(200).json({
      token,  // JWT token
      user: {
        _id: user._id,       // Return user ID
        FullName: user.name // Return full name
      }
    });


  } catch (err) {
    // Handle other errors, e.g., database connection issues
    console.error(err);
    res.status(500).json("Internal server error happens");
  }
};



let LoginGoogle = async (req, res) => {
  try {
    const { email, googleId} = req.body;

    // Check if user already exists
    const user = await User.findOne({ email: email});

    const id = user.googleId;
    

    if (id){
      const token = generateToken(user);
    
      res.status(200).json({
        token,  // JWT token
        user: {
          _id: user._id,       // Return user ID
          FullName: user.name // Return full name
        }
      });
    } else {
      res.status(400).json("Login Manually");
    }

  } catch (error) {
    res.status(500).json({ message: 'Authentication failed'});
  }
};


module.exports = { RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle, LoginGoogle}