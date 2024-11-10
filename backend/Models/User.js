const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/ // Basic email format validation
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    required: true
  },
  googleId: { 
    type: String, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
});

// Create a User model
const User = mongoose.model("User", userSchema);

module.exports = User;
