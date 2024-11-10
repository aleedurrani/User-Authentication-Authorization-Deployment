let signupRequests = require("../Models/signupRequestModel");

exports.getSignupRequests = (req, res) => {
  console.log("Fetching signup requests...");
  const { email, role } = req.query;

  let filteredRequests = signupRequests.filter(
    (request) => request.status === "pending"
  );

  console.log("Filtered Requests:", filteredRequests);

  if (email) {
    filteredRequests = filteredRequests.filter((request) =>
      request.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  if (role) {
    filteredRequests = filteredRequests.filter((request) =>
      request.requestedRole.toLowerCase().includes(role.toLowerCase())
    );
  }

  res.json(filteredRequests);
};

exports.approveSignupRequest = (req, res) => {
  const id = parseInt(req.params.id);
  const requestIndex = signupRequests.findIndex((request) => request.id === id);

  if (requestIndex === -1) {
    return res.status(404).json({ error: "Signup request not found" });
  }

  signupRequests[requestIndex].status = "approved";

  res.json({ message: "Signup request approved" });
};

exports.rejectSignupRequest = (req, res) => {
  const id = parseInt(req.params.id);
  const requestIndex = signupRequests.findIndex((request) => request.id === id);

  if (requestIndex === -1) {
    return res.status(404).json({ error: "Signup request not found" });
  }

  signupRequests[requestIndex].status = "rejected";

  res.json({ message: "Signup request rejected" });
};
