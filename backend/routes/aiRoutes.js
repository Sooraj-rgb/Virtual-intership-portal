const express = require("express");
const router = express.Router();

// simple local AI brain
function getReply(msg) {
  msg = msg.toLowerCase();

  // greetings
  if (msg.includes("hi") || msg.includes("hello")) {
    return "Hi! I'm your internship assistant. Ask me anything about the portal 😊";
  }

  // apply
  if (msg.includes("apply")) {
    return "Open Browse Internships, choose a role, and click the Apply button.";
  }

  // skills
  if (msg.includes("skill")) {
    return "Common skills: HTML, CSS, JavaScript, Python, React, Node, MongoDB.";
  }

  // admin
  if (msg.includes("admin")) {
    return "Admin manages students, companies, and internships.";
  }

  // company
  if (msg.includes("company")) {
    return "Companies can post internships and review applicants.";
  }

  // recommendation
  if (msg.includes("recommend")) {
    return "Your dashboard shows AI-based internship recommendations based on your skills.";
  }

  // default
  return "Sorry, I didn't understand. Try asking about internships, skills, or applications.";
}

router.post("/chat", (req, res) => {
  const message = req.body.message || "";
  const reply = getReply(message);
  res.json({ reply });
});

module.exports = router;
