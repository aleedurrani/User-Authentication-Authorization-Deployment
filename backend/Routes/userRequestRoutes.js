// backend/Routes/userRequestRoutes.js
const express = require("express");
const router = express.Router();
const userRequestController = require("../Controller/userRequestController");

router.get("/requests", userRequestController.getAllRequests);
router.post("/update-status", userRequestController.updateRequestStatus);

module.exports = router;
