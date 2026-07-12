const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const reminderController = require("../controllers/reminderController");

router.post("/", auth, reminderController.createReminder);
router.get("/", auth, reminderController.getMyReminders);
router.get("/due", auth, reminderController.getDueReminders);
router.post("/:id/snooze", auth, reminderController.snoozeReminder);
router.post("/:id/complete", auth, reminderController.completeReminder);

module.exports = router;
