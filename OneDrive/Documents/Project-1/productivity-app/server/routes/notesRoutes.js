const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const notesController = require("../controllers/notesController");

router.post("/", auth, notesController.createNote);
router.get("/", auth, notesController.getMyNotes);
router.put("/:id", auth, notesController.updateNote);
router.delete("/:id", auth, notesController.deleteNote);

module.exports = router;
