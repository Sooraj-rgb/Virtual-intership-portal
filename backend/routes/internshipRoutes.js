const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const jwt = require("jsonwebtoken");

// ✅ Middleware to verify company token
function verifyCompanyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.companyId = decoded.id;
    next();
  });
}

// ✅ POST: Add Internship
router.post("/add", verifyCompanyToken, async (req, res) => {
  try {
    const { title, location, duration, stipend, description } = req.body;

    if (!title || !location || !duration || !description) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const internship = new Internship({
      title,
      location,
      duration,
      stipend,
      description,
      companyId: req.companyId,
    });

    await internship.save();
    res.status(201).json({ message: "Internship posted successfully", internship });
  } catch (err) {
    console.error("❌ Internship posting error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET: All internships (optional - for student browsing)
router.get("/all", async (req, res) => {
  try {
    const internships = await Internship.find().populate("companyId", "name email industry");
    res.status(200).json(internships);
  } catch (err) {
    console.error("❌ Error fetching internships:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET: Internships by Company ID
router.get("/company/:companyId", verifyCompanyToken, async (req, res) => {
  try {
    const internships = await Internship.find({ companyId: req.companyId }).populate("companyId", "name email industry");
    res.status(200).json(internships);
  } catch (err) {
    console.error("❌ Error fetching company internships:", err);
    res.status(500).json({ error: "Server error" });
  }
});
const calculateSimilarity = require("../ai/matchInternships");
const Student = require("../models/Student");

// AI RECOMMENDATION
router.get("/recommend/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const internships = await Internship.find().populate("companyId", "name");

    const studentText =
      `${student.course || ""} ${(student.skills || []).join(" ")}`;

    const allDocs = internships.map(i =>
      `${i.title} ${i.description}`
    );

    const results = internships.map(i => {
      const internshipText = `${i.title} ${i.description}`;

      const score = calculateSimilarity(
        studentText,
        internshipText,
        allDocs
      );

      return {
        internship: i,
        matchScore: score,
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    res.json(results);
  } catch (err) {
    console.error("AI recommend error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
