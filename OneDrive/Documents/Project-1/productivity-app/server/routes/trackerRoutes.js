const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const trackerController = require("../controllers/trackerController");

router.post("/", auth, trackerController.createTracker);
router.get("/", auth, trackerController.getTrackers);
router.get("/:id/entries", auth, trackerController.getTrackerEntries);
router.post("/:id/entry", auth, trackerController.addOrUpdateEntry);
router.delete("/:id", auth, trackerController.deleteTracker);
router.get("/:id/report", auth, trackerController.getTrackerReport);

module.exports = router;
