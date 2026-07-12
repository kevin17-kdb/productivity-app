const Reminder = require("../models/Reminder");
const jsonDb = require("../utils/jsonDb");

// POST /api/reminders
exports.createReminder = async (req, res) => {
  try {
    const { workspace, title, type, task, triggerTime } = req.body;

    if (global.useJsonDb) {
      const reminder = await jsonDb.reminders.create({
        workspace,
        user: req.user.id,
        title,
        type,
        task: task || null,
        triggerTime,
        completed: false,
        dismissedCount: 0,
      });
      return res.json(reminder);
    }

    const reminder = new Reminder({
      workspace,
      user: req.user.id,
      title,
      type,
      task: task || undefined,
      triggerTime,
    });
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reminders?workspace=ID
exports.getMyReminders = async (req, res) => {
  try {
    const { workspace } = req.query;

    if (global.useJsonDb) {
      const all = await jsonDb.reminders.find({ workspace, user: req.user.id, completed: false });
      return res.json(all);
    }

    const reminders = await Reminder.find({
      workspace,
      user: req.user.id,
      completed: false,
    }).sort({ triggerTime: 1 });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reminders/due?workspace=ID
exports.getDueReminders = async (req, res) => {
  try {
    const { workspace } = req.query;
    const now = new Date();

    if (global.useJsonDb) {
      const all = await jsonDb.reminders.find({ workspace, user: req.user.id, completed: false });
      const due = all.filter((r) => {
        const checkTime = r.snoozeUntil || r.triggerTime;
        return new Date(checkTime) <= now;
      });
      return res.json(due);
    }

    const due = await Reminder.find({
      workspace,
      user: req.user.id,
      completed: false,
      $or: [
        { snoozeUntil: { $lte: now }, snoozeUntil: { $exists: true } },
        { snoozeUntil: { $exists: false }, triggerTime: { $lte: now } },
      ],
    });

    res.json(due);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reminders/:id/snooze
exports.snoozeReminder = async (req, res) => {
  try {
    const now = new Date();

    if (global.useJsonDb) {
      const reminder = await jsonDb.reminders.findById(req.params.id);
      if (!reminder) return res.status(404).json({ message: "Reminder not found" });

      if (reminder.type === "required") {
        const snoozeUntil = new Date(now.getTime() + 5 * 60 * 1000);
        reminder.snoozeUntil = snoozeUntil;
        reminder.dismissedCount = (reminder.dismissedCount || 0) + 1;
      } else {
        reminder.completed = true;
        reminder.dismissedCount = (reminder.dismissedCount || 0) + 1;
      }

      await jsonDb.reminders.update(reminder._id, reminder);
      return res.json(reminder);
    }

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    if (reminder.type === "required") {
      reminder.snoozeUntil = new Date(now.getTime() + 5 * 60 * 1000);
      reminder.dismissedCount += 1;
    } else {
      reminder.completed = true;
      reminder.dismissedCount += 1;
    }

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reminders/:id/complete
exports.completeReminder = async (req, res) => {
  try {
    if (global.useJsonDb) {
      const reminder = await jsonDb.reminders.findById(req.params.id);
      if (!reminder) return res.status(404).json({ message: "Reminder not found" });
      reminder.completed = true;
      await jsonDb.reminders.update(reminder._id, { completed: true });
      return res.json(reminder);
    }

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    reminder.completed = true;
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
