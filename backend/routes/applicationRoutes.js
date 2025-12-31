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
      .populate("studentId", "name email skills")
      .populate("internshipId", "title");

    res.status(200).json(applications);
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

module.exports = router;
