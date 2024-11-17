const mongoose = require("mongoose");
const User = require("./User"); // Import the User model

// Define the Admin schema that extends the User schema
const adminSchema = new mongoose.Schema({
  permissions: {
    type: [String],
    default: [
      "create_user",
      "delete_user",
      "assign_role",
      "grant_permission",
      "view_logs"
    ]
  }
});

// Create an Admin discriminator
const Admin = User.discriminator("Admin", adminSchema);

module.exports = Admin;