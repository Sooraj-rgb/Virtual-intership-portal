const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.js");
const Student = require("../models/Student.js");
const Company = require("../models/Company.js");
const Internship = require("../models/Internship.js");
const adminAuth = require("../middleware/adminAuth");

// ✅ ADMIN SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing admin
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("❌ Admin signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET all students (ADMIN)
router.get("/students", adminAuth,async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.status(200).json(students);
  } catch (err) {
    console.error("Admin get students error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// GET all companies (ADMIN)
router.get("/companies",adminAuth, async (req, res) => {
  try {
    const companies = await Company.find().select("-password");
    res.status(200).json(companies);
  } catch (err) {
    console.error("Admin get companies error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// GET all internships (ADMIN)
router.get("/internships", adminAuth, async (req, res) => {
  try {
    const internships = await Internship.find().populate("companyId", "name");
    res.status(200).json(internships);
  } catch (err) {
    console.error("Admin get internships error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE internship (ADMIN ONLY)
router.delete("/internships/:id", adminAuth, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    await internship.deleteOne();

    res.status(200).json({ message: "Internship deleted successfully" });
  } catch (err) {
    console.error("Admin delete internship error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
