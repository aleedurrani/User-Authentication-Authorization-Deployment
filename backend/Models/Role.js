const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    enum: [
      "Patient",
      "Doctor",
      "Nurse",
      "Pharmacist",
      "Lab Technician",
      "Admin",
    ],
    required: true
  },
  permissions: {
    type: [String],
    default: []
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

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
