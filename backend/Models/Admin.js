const mongoose = require("mongoose");

// Define the Admin schema that extends the User schema
const adminSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    required: true
  },
  role: [{
    type: String,
    required: true
  }],
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


// Create an Admin model
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
