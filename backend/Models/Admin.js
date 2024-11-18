const mongoose = require("mongoose");
const User = require("./User"); 

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

const Admin = User.discriminator("Admin", adminSchema);

module.exports = Admin;