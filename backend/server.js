const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);
const companyRoutes = require("./routes/companyRoutes");
app.use("/api/companies", companyRoutes);
const internshipRoutes = require("./routes/internshipRoutes");
app.use("/api/internships", internshipRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Simple test route
app.get("/", (req, res) => {
  res.send("🚀 Virtual Internship Portal backend connected to MongoDB!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
