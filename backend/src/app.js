const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const pageRoutes = require("./routes/pageRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/pages", pageRoutes);
app.use("/api/v1/public", publicRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RenewCred CMS API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

module.exports = app;
