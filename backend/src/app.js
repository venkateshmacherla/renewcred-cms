const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RenewCred CMS API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

module.exports = app;
