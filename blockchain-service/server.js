const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

// Routes
app.use("/api/marketplace", marketplaceRoutes);

// Root route for checking if server is running
app.get("/", (req, res) => {
  res.send("NFT Marketplace API is running");
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
