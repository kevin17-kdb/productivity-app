const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const {
    createTask,
    getTasks,
    updateTask,
    toggleComplete,
    deleteTask,
    addAttachment,
    savePrivateNote
} = require("../controllers/taskController");

// Require auth token for all task operations
router.use(authMiddleware);

// Get list of tasks
router.get("/", checkRole(["Architect", "Planner", "Contributor", "Observer"]), getTasks);

// Create task
router.post("/", checkRole(["Architect", "Planner"]), createTask);

// Update task details
router.patch("/:id", checkRole(["Architect", "Planner"]), updateTask);

// Toggle completion status
router.patch("/:id/complete", checkRole(["Architect", "Planner", "Contributor"]), toggleComplete);

// Delete task
router.delete("/:id", checkRole(["Architect"]), deleteTask);

// Add task attachment
router.post("/:id/attachments", checkRole(["Architect", "Planner", "Contributor"]), addAttachment);

// Save private note
router.post("/:id/private-note", checkRole(["Architect", "Planner", "Contributor", "Observer"]), savePrivateNote);

module.exports = router;
