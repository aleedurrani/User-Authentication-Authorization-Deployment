// backend/app.js

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

// Import routes
const signupRequestsRoutes = require("./Routes/signupRequestsRoutes");

app.use(express.json());
app.use(cors());

// Use the signup requests routes
app.use("/api/signup-requests", signupRequestsRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
