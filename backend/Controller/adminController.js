const Request = require('../Models/Request');
const User = require('../Models/User');
const Role = require('../Models/Role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAdminRequests = async (req, res) => {
    try {
        const pendingRequests = await Request.find({ requestType: 'signup', status: 'pending' });
        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error('Error fetching signup requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const approveRequest = async (req, res) => {
    const requestId = req.params.id;

    try {
        const request = await Request.findById(requestId);

        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Signup request not found or already processed.' });
        }

        const { email, password, name, role } = request.requestData;

        const roleData = await Role.findOne({ roleName: role });
        if (!roleData) {
            return res.status(400).json({ message: 'Requested role does not exist.' });
        }

        const newUser = new User({
            email,
            name,
            passwordHash: password,
            role,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newUser.save();

        request.status = 'approved';
        await request.save();

        res.status(200).json({ message: 'Signup request approved and user created successfully.' });
    } catch (error) {
        console.error('Error approving signup request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const rejectRequest = async (req, res) => {
    const requestId = req.params.id;

    try {
        const request = await Request.findById(requestId);

        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Signup request not found or already processed.' });
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ message: 'Signup request has been rejected.' });
    } catch (error) {
        console.error('Error rejecting signup request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const verifyAdmin = async (req, res) => {
  try {
    const userId = res.locals.userId; // From verifyToken middleware

    const user = await User.findById(userId);
    if (user && user.role === 'Admin') {
      res.status(200).json({ isAdmin: true });
    } else {
      res.status(200).json({ isAdmin: false });
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllRoles = async (req, res) => {
    try {
      const roles = await Role.find({});
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};
  
const searchUserByEmail = async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required.' });
    }
  
    try {
      const user = await User.findOne({ email }).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error searching user by email:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getUserDetails = async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findById(id).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateUserPermissions = async (req, res) => {
    const { id } = req.params;
    const { permissions } = req.body;
  
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions should be an array of strings.' });
    }
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      user.permissions = permissions;
      user.updatedAt = new Date();
      await user.save();
  
      res.status(200).json({ message: 'User permissions updated successfully.' });
    } catch (error) {
      console.error('Error updating user permissions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateUserRoleAndStatus = async (req, res) => {
    const { id } = req.params;
    const { role, status } = req.body;
  
    if (!role && !status) {
      return res.status(400).json({ message: 'At least one of role or status must be provided.' });
    }
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      if (role) {
        const roleData = await Role.findOne({ roleName: role });
        if (!roleData) {
          return res.status(400).json({ message: 'Provided role does not exist.' });
        }
        user.role = role;
        user.permissions = roleData.permissions; // Optionally reset permissions based on role
      }
  
      if (status) {
        if (!['active', 'inactive', 'suspended'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status value.' });
        }
        user.status = status;
      }
  
      user.updatedAt = new Date();
      await user.save();
  
      res.status(200).json({ message: 'User role and/or status updated successfully.' });
    } catch (error) {
      console.error('Error updating user role/status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAllPermissions = async (req, res) => {
    try {
      const roles = await Role.find({});
      const permissionsSet = new Set();
      roles.forEach(role => {
        role.permissions.forEach(permission => permissionsSet.add(permission));
      });
      const allPermissions = Array.from(permissionsSet);
      res.status(200).json(allPermissions);
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getAdminRequests,
    approveRequest,
    rejectRequest,
    verifyAdmin,
    getAllRoles,
    searchUserByEmail,
    getUserDetails,
    updateUserPermissions,
    updateUserRoleAndStatus,
    getAllPermissions
};  