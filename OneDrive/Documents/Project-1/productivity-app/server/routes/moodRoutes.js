const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createMoodLog, getMyMoodLogs, getUserMoodLogs } = require("../controllers/moodController");

// Secure all mood endpoints
router.use(authMiddleware);

// Log a new mood
router.post("/", createMoodLog);

// Get logged-in user's logs
router.get("/me", getMyMoodLogs);

// Get workspace member's logs (Architect only)
router.get("/user", getUserMoodLogs);

module.exports = router;
