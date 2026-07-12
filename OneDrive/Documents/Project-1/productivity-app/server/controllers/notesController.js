const Note = require("../models/Note");
const jsonDb = require("../utils/jsonDb");

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { workspace, content, tags } = req.body;

    if (global.useJsonDb) {
      const note = await jsonDb.notes.create({
        user: req.user.id,
        workspace,
        content,
        tags: tags || [],
      });
      return res.json(note);
    }

    const note = new Note({
      user: req.user.id,
      workspace,
      content,
      tags: tags || [],
    });
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notes?workspace=ID&tagType=task
exports.getMyNotes = async (req, res) => {
  try {
    const { workspace, tagType } = req.query;

    if (global.useJsonDb) {
      let notes = await jsonDb.notes.find({ workspace, user: req.user.id });
      if (tagType) {
        notes = notes.filter((n) => n.tags && n.tags.some((t) => t.type === tagType));
      }
      return res.json(notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }

    const query = { workspace, user: req.user.id };
    if (tagType) {
      query["tags.type"] = tagType;
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (global.useJsonDb) {
      const note = await jsonDb.notes.findById(req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found" });
      if (note.user !== req.user.id) return res.status(403).json({ message: "Not your note" });
      await jsonDb.notes.update(req.params.id, { content });
      return res.json({ ...note, content });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ message: "Not your note" });
    note.content = content;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    if (global.useJsonDb) {
      const note = await jsonDb.notes.findById(req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found" });
      if (note.user !== req.user.id) return res.status(403).json({ message: "Not your note" });
      await jsonDb.notes.delete(req.params.id);
      return res.json({ message: "Note deleted" });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ message: "Not your note" });
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
