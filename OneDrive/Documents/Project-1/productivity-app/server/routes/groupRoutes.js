const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createGroup, addMember, getGroups, removeMember, updateMemberRole } = require("../controllers/groupController");

// Protect all group routes
router.use(authMiddleware);

// Workspace actions
router.post("/", createGroup);
router.post("/member", addMember);
router.delete("/member", removeMember);
router.put("/member/role", updateMemberRole);
router.get("/", getGroups);

module.exports = router;
