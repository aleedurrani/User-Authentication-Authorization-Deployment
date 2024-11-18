const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { format } = require('date-fns');
const User = require('../Models/User')
const Request = require('../Models/Request')
const Role = require('../Models/Role')
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
    const newRequest = new Request({
      requestType: 'signup',
      requestData: {
        email: req.body.Email,
        password: hashedPass,
        name: req.body.FirstName + " " + req.body.LastName,
        role: req.body.Role,
      },
      status: 'pending',  
    });

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

    const newRequest = new Request({
      requestType: 'signup',
      requestData: {
        email: req.body.Email,
        password: hashedPass,
        name: req.body.FirstName + " " + req.body.LastName,
        role: req.body.Role,
      },
      status: 'pending',  
      googleId: req.body.GoogleId
    });

    await newRequest.save();

 
    res.sendStatus(200);
  

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


let VerifyEmail = async (req, res) => {
  try {
    
    const pin = crypto.randomInt(10000, 99999); 
   
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
        console.error('Error sending email:', error); 
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
      return res.status(400).json("Wrong credentials!");
    }

    const token = generateToken(user);

    

    res.status(200).json({
      token, 
      user: {
        _id: user._id,
        FullName: user.name 
      }
    });


  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error happens");
  }
};



let LoginGoogle = async (req, res) => {
  try {
    const { email, googleId} = req.body;

    const user = await User.findOne({ email: email});

    const id = user.googleId;
    

    if (id){
      const token = generateToken(user);
    
      res.status(200).json({
        token,  
        user: {
          _id: user._id, 
          FullName: user.name
        }
      });
    } else {
      res.status(400).json("Login Manually");
    }

  } catch (error) {
    res.status(500).json({ message: 'Authentication failed'});
  }
};

let GetUserProfile = async (req,res) =>{

  const userId = res.locals.userId; 
  const roleId = res.locals.userrole
   
  try {
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const role = await Role.findOne({ roleName: userrole });

    
    if (!role) {
      return res.status(405).json({ message: 'Role not found' });
    }
  
    const memberSince = format(new Date(userProfile.createdAt), 'MMMM dd, yyyy');


    res.status(200).json({
      name: userProfile.name,
    email: userProfile.email,
    status: userProfile.status,
    role: role.roleName,
    permissions: role.permissions,
    joined: memberSince

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



const ProtectedRoute = async (req, res) =>{
  const { userId } = req.body; 
  const decodedUserId = res.locals.userId;

  if (decodedUserId === userId) {
    return res.status(200).json({ message: 'Token is valid', userId: decodedUserId, userFullName: res.locals.userFullName });
  } else {
    return res.status(401).json('Access denied: Invalid user ID');
  }
};



module.exports = { RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle, LoginGoogle, GetUserProfile, ProtectedRoute}