const express = require("express");
const router = express.Router();

const signupRequestsController = require("../Controller/signupRequestsController");

router.get("/", signupRequestsController.getSignupRequests);

router.post("/:id/approve", signupRequestsController.approveSignupRequest);

router.post("/:id/reject", signupRequestsController.rejectSignupRequest);

module.exports = router;
