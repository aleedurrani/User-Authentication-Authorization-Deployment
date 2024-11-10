// backend/Controller/userRequestController.js
const UserRequest = require("../Models/UserRequest");

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await UserRequest.find({ status: "Pending" });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await UserRequest.findByIdAndUpdate(id, { status });
    res.status(200).json({ message: "Request status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
