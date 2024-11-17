const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Admin = require('../Models/Admin');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_STRING, {
    });

    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);

    const admin = new Admin({
      email: 'admin@example.com',
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
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();