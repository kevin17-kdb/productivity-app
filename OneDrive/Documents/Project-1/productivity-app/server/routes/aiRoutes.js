const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getWorkspaceAnalytics, getAICompletionCelebration } = require("../controllers/aiController");

// Secure all AI endpoints
router.use(authMiddleware);

// Get productivity coach reports and metrics
router.get("/analytics", getWorkspaceAnalytics);

// Get completion congratulations message
router.post("/celebrate", getAICompletionCelebration);

module.exports = router;
