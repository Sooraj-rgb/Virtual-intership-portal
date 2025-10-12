const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const router = express.Router();

// ✅ Student Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, skills, education, resumeLink } = req.body;
    console.log("📥 Incoming signup:", req.body);

    // check if already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      console.log("⚠️ Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new student
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      skills,
      education,
      resumeLink
    });

    await student.save();
    console.log("✅ Student saved successfully!");
    res.status(201).json({ message: "Student registered successfully" });

  } catch (err) {
    console.error("❌ Error in signup:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
