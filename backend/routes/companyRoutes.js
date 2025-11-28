const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../models/Company");

// ✅ Company Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, industry, location, description } = req.body;

    // Check if company already exists
    const existing = await Company.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = new Company({
      name,
      email,
      password: hashedPassword,
      industry,
      location,
      description,
    });

    await company.save();
    res.status(201).json({ message: "Company registered successfully" });
  } catch (err) {
    console.error("❌ Company signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Company Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find company
    const company = await Company.findOne({ email });
    if (!company) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      company,
    });
  } catch (err) {
    console.error("❌ Company login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
