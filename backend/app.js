// Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoute = require("./Routes/auth");
const adminRoute = require("./Routes/admin");
const dashboardRoute = require("./Routes/dashboard");
// Initialize environment variables
dotenv.config();

// Create an Express application
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_STRING, {
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Route setup
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/dashboard", dashboardRoute);
// Start the server
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
