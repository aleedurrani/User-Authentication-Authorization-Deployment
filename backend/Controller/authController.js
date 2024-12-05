const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { format } = require('date-fns');
const User = require('../Models/User')
const Admin = require('../Models/Admin')
const Request = require('../Models/Request')
const Role = require('../Models/Role')
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { permission } = require("process");

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

      const roleFound = await Role.findOne({
        roleName: req.body.Role,
        initial: true,
        duplicate: false
      });

      if (!roleFound) {
        return res.status(404).json({ message: `Role "${req.body.Role}" is not available or invalid.` });
      }

      // Create a new request entry
      const newRequest = new Request({
        requestType: 'signup',
        requestData: {
          email: req.body.Email,
          password: hashedPass,
          name: req.body.FirstName + " " + req.body.LastName,
          role: req.body.Role,
          permissions: roleFound.permissions
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


    const roleFound = await Role.findOne({
      roleName: req.body.Role,
      initial: true,
      duplicate: false
    });


    if (!roleFound) {
      return res.status(404).json({ message: `Role "${req.body.Role}" is not available or invalid.` });
    }

    // Create a new request entry

    const newRequest = new Request({
      requestType: 'signup',
      requestData: {
        email: req.body.Email,
        password: hashedPass,
        name: req.body.FirstName + " " + req.body.LastName,
        role: req.body.Role,
        permissions: roleFound.permissions
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


let VerifyUserCredentials = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.Email });

    if (!user) {
      // If user is not found
      return res.status(400).json("User not found!");
    }


    const pin = crypto.randomInt(10000, 99999); // Generate a 6-digit PIN
    user.resetPin = pin;
    user.pinExpires = Date.now() + 300000;  // PIN valid for 1 hour
    await user.save();

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
      subject: "Password Reset PIN",
      text: `Your password reset PIN is ${pin}`,
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


const UpdateUserPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.Email });

    if (!user) {
      // If user is not found
      return res.status(400).json("User not found!");
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.NewPassword, salt);

    // Update user's password in the database
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json("Password updated successfully!");
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
    const { email, googleId } = req.body;

    // Check if user already exists
    const user = await User.findOne({ email: email });

    const id = user.googleId;


    if (id) {
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
    res.status(500).json({ message: 'Authentication failed' });
  }
};

let GetUserProfile = async (req, res) => {

  const userId = res.locals.userId;
  const roleIds = res.locals.userrole

  try {
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }


    const roles = await Role.find({ _id: { $in: roleIds } });

    if (!roles || roles.length === 0) {
      return res.status(405).json({ message: 'No roles found' });
    }

    // Create a map of roles by their ID for quick lookup
    const roleMap = new Map(roles.map((role) => [role._id.toString(), role]));

    // Reorder roles based on the order of roleIds
    const sortedRoles = roleIds.map((id) => roleMap.get(id.toString()));

    // Extract role names in the correct order
    const roleNames = sortedRoles.map((role) => role.roleName);

    
    const memberSince = format(new Date(userProfile.createdAt), 'MMMM dd, yyyy');


    res.status(200).json({
      name: userProfile.name,
      email: userProfile.email,
      status: userProfile.status,
      role: roleNames,
      permissions: roles.flatMap((role) => role.permissions),
      joined: memberSince

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


const GetAvailableRoles = async (req, res) => {
  const roleIds = res.locals.userrole; // Array of role IDs

  if (!roleIds || roleIds.length === 0) {
    return res.status(400).json({ message: 'User roles not found' });
  }

  try {
    // Fetch role names based on the role IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
      return res.status(404).json({ message: 'Roles not found' });
    }

    // Extract the first word of the first role's name
    const firstRolePrefix = roles[0].roleName.split(' ')[0]; // Split and take the first word

    // Find all other roles that match the prefix, excluding the roles the user already has
    const availableRoles = await Role.find({
      roleName: { $regex: `^${firstRolePrefix}`, $options: 'i' }, // Match roles starting with the prefix
      _id: { $nin: roleIds }, // Exclude roles already assigned to the user
      initial: true,
      duplicate: false
    });

    if (availableRoles.length === 0) {
      return res.status(404).json({ message: 'No available roles found' });
    }

    // Map the roles with their permissions
    const rolesWithPermissions = availableRoles.map((role) => ({
      roleName: role.roleName,
      permissions: role.permissions,
    }));

    res.status(200).json({ availableRoles: rolesWithPermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const GetAvailablePermissions = async (req, res) => {
  const roleIds = res.locals.userrole; // Array of role IDs

  if (!roleIds || roleIds.length === 0) {
    return res.status(400).json({ message: 'User roles not found' });
  }

  try {
    // Fetch role names based on the role IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
      return res.status(404).json({ message: 'Roles not found' });
    }

    // Extract the first word of the first role's name
    const firstRolePrefix = roles[0].roleName.split(' ')[0]; // Split and take the first word

    // Find all other roles that match the prefix, excluding the roles the user already has
    const availableRoles = await Role.find({
      roleName: { $regex: `^${firstRolePrefix}`, $options: 'i' }, // Match roles starting with the prefix
      _id: { $nin: roleIds }, // Exclude roles already assigned to the user
      initial: true,
    });

    if (availableRoles.length === 0) {
      return res.status(404).json({ message: 'No available roles found' });
    }

    // Map the roles to return only the permissions
    const rolePermissions = availableRoles.map((role) => role.permissions);

    res.status(200).json({ availableRolePermissions: rolePermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};





const ProtectedRoute = async (req, res) => {
  const { userId } = req.body; // Expecting userId from the request body
  const decodedUserId = res.locals.userId; // The ID from the decoded token

  // Check if the IDs match
  if (decodedUserId === userId) {
    const user = await User.findById(decodedUserId);
    if (user) {
      return res.status(200).json({
        message: 'Token is valid',
        userId: decodedUserId,
        userFullName: res.locals.userFullName
      });
    }
    return res.status(404).json('User not found');
  } else {
    return res.status(401).json('Access denied: Invalid user ID');
  }
};



const GetRequests = async (req, res) => {
  const userId = res.locals.userId;


  try {
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const requests = await Request.find({
      requestType: { $ne: 'signup' },
      'requestData.email': userProfile.email
    });

    res.status(200).json(requests);

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



const RoleChange = async (req, res) => {
  const userId = res.locals.userId;
  const roleIds = res.locals.userrole

  try {
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const roles = await Role.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
      return res.status(404).json({ message: 'Roles not found' });
    }

    const currentRoles = await Role.find({
      _id: { $in: roleIds },
    });

    if (currentRoles.length === 0) {
      return res.status(404).json({ message: 'No available roles found' });
    }

    // Map the roles to return only the permissions
    const currentPermissions = currentRoles.flatMap((role) => role.permissions);
    const currentRoleNames = currentRoles.map((role) => role.roleName);


    const newRole = await Role.findOne({
      roleName: req.body.newRole,
      initial: true,
      duplicate: false
    });

    if (!newRole) {
      return res.status(404).json({ message: `Role "${req.body.newRole}" is not available or invalid.` });
    }

    const newRequest = new Request({
      requestType: 'role change',
      requestData: {
        email: userProfile.email,
        roles: currentRoleNames,
        newRole: req.body.newRole,
        permissions: newRole.permissions,
        currentPermissions: currentPermissions
      },
      // Pass the role from the request
      status: 'pending',
    });

    // Save the request to the database
    await newRequest.save();



    res.status(200).json({ message: 'User profile not found' });

  } catch (error) {

    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


const PermissionChange = async (req, res) => {
  const userId = res.locals.userId;
  const roleIds = res.locals.userrole

  try {
    // Fetch user profile
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const roles = await Role.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
      return res.status(404).json({ message: 'Roles not found' });
    }

    const currentRoles = await Role.find({
      _id: { $in: roleIds },
    });

    if (currentRoles.length === 0) {
      return res.status(404).json({ message: 'No available roles found' });
    }

    // Map the roles to return only the permissions
    const currentPermissions = currentRoles.flatMap((role) => role.permissions);
    const currentRoleNames = currentRoles.map((role) => role.roleName);

    const { newPermissions } = req.body;

    // Validate permissions
    if (!Array.isArray(newPermissions) || newPermissions.length === 0) {
      return res.status(400).json({ message: 'Permissions must be a non-empty array' });
    }

    // Create a new permission change request
    const newRequest = new Request({
      requestType: 'permission change',
      requestData: {
        email: userProfile.email,
        permissions: newPermissions,
        currentPermissions: currentPermissions,
        roles: currentRoleNames
      },
      status: 'pending',
    });

    // Save the request to the database
    await newRequest.save();

    res.status(200).json({ message: 'Permission change request submitted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



module.exports = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  RegisterUserGoogle,
  LoginGoogle,
  GetUserProfile,
  ProtectedRoute,
  GetRequests,
  RoleChange,
  PermissionChange,
  VerifyUserCredentials,
  UpdateUserPassword,
  GetAvailableRoles,
  GetAvailablePermissions,
}