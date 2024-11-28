const mongoose = require("mongoose");

// Define the Role schema
const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    default: []
  },
  initial: {
    type: Boolean,
    default: false
  },
  duplicate: {
    type: Boolean,
    default: true
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

// Create a Role model
const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
