const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const studentAuth = require("../middleware/studentAuth");
const router = express.Router();

// Student Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, skills, education, resumeLink } = req.body;
    console.log("Incoming signup:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedSkills = Array.isArray(skills)
      ? skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [];

    // check if already exists
    const existing = await Student.findOne({ email: normalizedEmail });
    if (existing) {
      console.log("Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new student
    const student = new Student({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      skills: normalizedSkills,
      education,
      resumeLink,
    });

    await student.save();
    console.log("Student saved successfully");
    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Student signup error:", err);

    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (err && err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ error: "Server error" });
  }
});

// Student Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find student by email
    const student = await Student.findOne({ email: normalizedEmail });
    if (!student) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Create JWT token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      student,
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Student Profile
router.put("/:id", studentAuth, async (req, res) => {
  try {
    if (req.studentId !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, education, skills, resumeLink } = req.body;

    const update = {
      name,
      education,
      resumeLink,
    };

    if (Array.isArray(skills)) {
      update.skills = skills;
    } else if (typeof skills === "string") {
      update.skills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Profile updated", student });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
