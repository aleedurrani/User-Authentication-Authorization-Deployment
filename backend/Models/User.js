const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/ 
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
      required: true,
      enum: ["Patient", "Doctor", "Nurse", "Pharmacist", "Lab Technician", "Admin"] 
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
    },
  },
  { 
    discriminatorKey: 'userType',
    collection: 'users' 
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;