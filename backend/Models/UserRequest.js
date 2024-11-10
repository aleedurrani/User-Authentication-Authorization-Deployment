// backend/Models/UserRequest.js
const mongoose = require("mongoose");

const userRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  requestedRole: String,
  permissions: [String],
  status: { type: String, default: "Pending" }, // 'Pending', 'Approved', or 'Rejected'
});

module.exports = mongoose.model("UserRequest", userRequestSchema);
