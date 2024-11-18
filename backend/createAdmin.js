const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./Models/User');

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

    const admin = new User({
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
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();