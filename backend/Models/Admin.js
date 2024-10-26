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

// Inherit User schema properties
adminSchema.add(User.schema);

// Create an Admin model
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
