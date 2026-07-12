const WorkLog = require("../models/WorkLog");
const jsonDb = require("../utils/jsonDb");

// GET /api/worklog?workspace=ID&date=YYYY-MM-DD&userId=ID (userId optional, defaults to self)
exports.getLog = async (req, res) => {
  try {
    const { workspace, date, userId } = req.query;
    const targetUser = userId || req.user.id;

    if (global.useJsonDb) {
      const log = await jsonDb.worklogs.findOne({
        workspace,
        user: targetUser,
        date,
      });
      return res.json(log || { entries: [], reflection: "" });
    }

    const log = await WorkLog.findOne({
      workspace,
      user: targetUser,
      date,
    }).populate("entries.taggedTask", "title");

    res.json(log || { entries: [], reflection: "" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/worklog/entry
exports.addEntry = async (req, res) => {
  try {
    const { workspace, date, content, taggedTask } = req.body;

    if (global.useJsonDb) {
      let log = await jsonDb.worklogs.findOne({
        workspace,
        user: req.user.id,
        date,
      });
      if (!log) {
        log = await jsonDb.worklogs.create({
          workspace,
          user: req.user.id,
          date,
          entries: [],
          reflection: "",
        });
      }
      log.entries.push({ content, taggedTask: taggedTask || null, createdAt: new Date().toISOString() });
      await jsonDb.worklogs.update(log._id, { entries: log.entries });
      return res.json(log);
    }

    let log = await WorkLog.findOne({
      workspace,
      user: req.user.id,
      date,
    });

    if (!log) {
      log = new WorkLog({
        workspace,
        user: req.user.id,
        date,
        entries: [],
      });
    }

    log.entries.push({ content, taggedTask: taggedTask || undefined });
    await log.save();

    const populated = await log.populate("entries.taggedTask", "title");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/worklog/entry
exports.removeEntry = async (req, res) => {
  try {
    const { workspace, date, entryIndex } = req.body;

    if (global.useJsonDb) {
      const log = await jsonDb.worklogs.findOne({
        workspace,
        user: req.user.id,
        date,
      });
      if (!log) return res.status(404).json({ message: "Log not found" });
      log.entries.splice(entryIndex, 1);
      await jsonDb.worklogs.update(log._id, { entries: log.entries });
      return res.json(log);
    }

    const log = await WorkLog.findOne({
      workspace,
      user: req.user.id,
      date,
    });

    if (!log) return res.status(404).json({ message: "Log not found" });
    log.entries.splice(entryIndex, 1);
    await log.save();

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/worklog/reflection
exports.updateReflection = async (req, res) => {
  try {
    const { workspace, date, reflection } = req.body;

    if (global.useJsonDb) {
      let log = await jsonDb.worklogs.findOne({
        workspace,
        user: req.user.id,
        date,
      });
      if (!log) {
        log = await jsonDb.worklogs.create({
          workspace,
          user: req.user.id,
          date,
          entries: [],
          reflection,
        });
      } else {
        log.reflection = reflection;
        await jsonDb.worklogs.update(log._id, { reflection });
      }
      return res.json(log);
    }

    let log = await WorkLog.findOne({
      workspace,
      user: req.user.id,
      date,
    });

    if (!log) {
      log = new WorkLog({
        workspace,
        user: req.user.id,
        date,
        entries: [],
        reflection,
      });
    } else {
      log.reflection = reflection;
    }

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/worklog/history?workspace=ID
exports.getLogHistory = async (req, res) => {
  try {
    const { workspace } = req.query;

    if (global.useJsonDb) {
      const allLogs = await jsonDb.worklogs.find({ workspace, user: req.user.id });
      const sorted = allLogs
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);
      return res.json(sorted);
    }

    const logs = await WorkLog.find({
      workspace,
      user: req.user.id,
    })
      .sort({ date: -1 })
      .limit(30)
      .select("date entries.content reflection createdAt");

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
