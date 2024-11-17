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
  
module.exports = {
    getAdminRequests,
    approveRequest,
    rejectRequest,
    verifyAdmin,
    getAllRoles
};  