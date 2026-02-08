const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Internship = require("../models/Internship");
const jwt = require("jsonwebtoken");

/* ---------------- STUDENT APPLY ---------------- */
router.post("/apply", async (req, res) => {
  try {
    const { studentId, internshipId } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // prevent duplicate applications
    const exists = await Application.findOne({ studentId, internshipId });
    if (exists) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = new Application({
      studentId,
      internshipId,
      companyId: internship.companyId,
    });

    await application.save();
    res.status(201).json({ message: "Application submitted" });

  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- COMPANY VIEW APPLICANTS ---------------- */
router.get("/company/:companyId", async (req, res) => {
  try {
    const applications = await Application.find({
      companyId: req.params.companyId,
    })
      .populate("studentId", "name email skills education")
      .populate("internshipId", "title requiredSkills description");

    const withScores = applications.map((app) => {
      const required = (app.internshipId?.requiredSkills || [])
        .map((s) => s.toLowerCase().trim())
        .filter(Boolean);
      const studentSkills = (app.studentId?.skills || [])
        .map((s) => s.toLowerCase().trim())
        .filter(Boolean);

      const textBlob = `${app.internshipId?.title || ""} ${app.internshipId?.description || ""} ${required.join(" ")}`.toLowerCase();
      let matchedCount = 0;

      if (studentSkills.length) {
        matchedCount = studentSkills.filter((s) => textBlob.includes(s)).length;
      }

      const denominator = required.length || studentSkills.length || 1;
      const matchScore = Math.round((matchedCount / denominator) * 100);

      return {
        ...app.toObject(),
        matchScore,
      };
    });

    withScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(withScores);
  } catch (err) {
    console.error("Company view applicants error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- ACCEPT / REJECT ---------------- */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await Application.findByIdAndUpdate(req.params.id, { status });
    res.status(200).json({ message: `Application ${status}` });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- STUDENT VIEW APPLICATIONS / NOTIFICATIONS ---------------- */
router.get("/student/:studentId", async (req, res) => {
  try {
    const applications = await Application.find({
      studentId: req.params.studentId,
    })
      .populate("internshipId", "title")
      .populate("internshipId.companyId", "name");

    res.status(200).json(applications);
  } catch (err) {
    console.error("Student view applications error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
