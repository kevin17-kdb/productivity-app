const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const workLogController = require("../controllers/workLogController");

router.get("/", auth, workLogController.getLog);
router.post("/entry", auth, workLogController.addEntry);
router.delete("/entry", auth, workLogController.removeEntry);
router.put("/reflection", auth, workLogController.updateReflection);
router.get("/history", auth, workLogController.getLogHistory);

module.exports = router;
