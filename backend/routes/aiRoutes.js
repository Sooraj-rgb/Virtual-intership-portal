const express = require("express");
const router = express.Router();

// simple local AI brain with intent scoring
function getReply(rawMsg) {
  const msg = (rawMsg || "").toLowerCase().trim();
  if (!msg) {
    return "Please type a question. For example: \"How do I apply?\" or \"What skills are required?\"";
  }

  const tokens = msg.split(/[^a-z0-9]+/).filter(Boolean);
  const has = (w) => tokens.includes(w);
  const textIncludes = (arr) => arr.some((w) => msg.includes(w));

  const intents = [
    {
      name: "greeting",
      keywords: ["hi", "hello", "hey","heyy", "good morning", "good afternoon", "good evening"],
      response: "Hi! I'm your internship assistant. Ask me anything about the portal.",
    },
    {
      name: "apply",
      keywords: ["apply", "application", "submit", "sign up", "join", "enroll"],
      response: "Go to Browse Internships, choose a role, then click the Apply button.",
    },
    {
      name: "skills",
      keywords: ["skills", "skill", "requirements", "required", "qualifications", "prerequisite"],
      response: "Common skills: HTML, CSS, JavaScript, Python, React, Node, MongoDB. Each listing shows its own requirements.",
    },
    {
      name: "recommendations",
      keywords: ["recommend", "recommendation", "suggest", "match", "best for me"],
      response: "Your dashboard shows AI-based internship recommendations based on your profile and skills.",
    },
    {
      name: "company",
      keywords: ["company", "employer", "recruiter", "organization","companies"],
      response: "Companies can post internships and review applicants.",
    },
    {
      name: "admin",
      keywords: ["admin", "administrator", "manage", "moderate"],
      response: "Admins manage students, companies, and internships.",
    },
    {
      name: "status",
      keywords: ["status", "progress", "update", "track", "application status"],
      response: "Open My Applications to track your status (Submitted, Under Review, Accepted, Rejected).",
    },
    {
      name: "profile",
      keywords: ["profile", "resume", "cv", "portfolio", "edit profile", "update profile"],
      response: "Open Profile to update your details, skills, and resume.",
    },
    {
      name: "help",
      keywords: ["help", "support", "contact", "issue", "problem"],
      response: "If something isn't working, describe the issue and I can guide you. You can also contact support from the Help section.",
    },
    {
      name: "thanks",
      keywords: ["thanks", "thank you", "thx", "appreciate"],
      response: "You're welcome. If you have more questions, just ask.",
    },
    {
      name: "goodbye",
      keywords: ["bye", "goodbye", "see you", "later"],
      response: "Goodbye. Come back anytime if you need help.",
    },
  ];

  // scoring: count keyword hits in tokens or phrase hits in full text
  let best = null;
  for (const intent of intents) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (kw.includes(" ")) {
        if (msg.includes(kw)) score += 2;
      } else if (has(kw)) {
        score += 1;
      } else if (msg.includes(kw)) {
        score += 0.5;
      }
    }
    if (!best || score > best.score) best = { intent, score };
  }

  if (best && best.score >= 1) {
    return best.intent.response;
  }

  // soft suggestion based on partial matches
  const suggestions = [];
  if (textIncludes(["intern", "internship"])) suggestions.push("internships");
  if (textIncludes(["apply", "application"])) suggestions.push("applications");
  if (textIncludes(["skill", "requirement"])) suggestions.push("skills");
  if (textIncludes(["recommend", "match"])) suggestions.push("recommendations");
  if (textIncludes(["profile", "resume", "cv"])) suggestions.push("profile");

  if (suggestions.length) {
    return `I might have info about: ${suggestions.join(", ")}. Ask me a specific question about one of those.`;
  }

  return "Sorry, I didn't understand. Try asking about internships, skills, applications, or your profile.";
}

router.post("/chat", (req, res) => {
  const message = req.body.message || "";
  const reply = getReply(message);
  res.json({ reply });
});

module.exports = router;
