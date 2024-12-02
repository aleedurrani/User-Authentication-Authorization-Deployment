const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const Admin = require('./Models/Admin');

const adminEmail = "admin@example.com";
const adminPass= "adminpassword";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_STRING, {});

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPass, salt);

    const admin = new Admin({
      email: adminEmail,
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'Admin', 
      permissions: [
        "create_user",
        "delete_user",
        "assign_role",
        "grant_permission",
        "view_logs"
      ],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Admin user created successfully.');
    console.log('Token:', token);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();