const Tracker = require("../models/Tracker");
const jsonDb = require("../utils/jsonDb");

// POST /api/trackers
exports.createTracker = async (req, res) => {
  try {
    const { workspace, name, type, visibility, headings } = req.body;

    if (global.useJsonDb) {
      const tracker = await jsonDb.trackers.create({
        workspace,
        creator: req.user.id,
        name,
        type,
        visibility: visibility || "personal",
        headings: headings || [],
        entries: [],
      });
      return res.json(tracker);
    }

    const tracker = new Tracker({
      workspace,
      creator: req.user.id,
      name,
      type,
      visibility: visibility || "personal",
      headings: headings || [],
      entries: [],
    });
    await tracker.save();
    res.json(tracker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trackers?workspace=ID
exports.getTrackers = async (req, res) => {
  try {
    const { workspace } = req.query;

    if (global.useJsonDb) {
      const allTrackers = await jsonDb.trackers.find({ workspace });
      const visible = allTrackers.filter(
        (t) =>
          t.visibility === "shared" ||
          t.creator === req.user.id
      );
      return res.json(visible);
    }

    const trackers = await Tracker.find({
      workspace,
      $or: [{ visibility: "shared" }, { creator: req.user.id }],
    }).populate("creator", "name email");

    res.json(trackers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trackers/:id/entries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.getTrackerEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (global.useJsonDb) {
      const tracker = await jsonDb.trackers.findById(req.params.id);
      if (!tracker) return res.status(404).json({ message: "Tracker not found" });
      let entries = tracker.entries || [];
      if (startDate) entries = entries.filter((e) => e.date >= startDate);
      if (endDate) entries = entries.filter((e) => e.date <= endDate);
      return res.json({ ...tracker, entries });
    }

    const tracker = await Tracker.findById(req.params.id);
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });

    let entries = tracker.entries;
    if (startDate) entries = entries.filter((e) => e.date >= startDate);
    if (endDate) entries = entries.filter((e) => e.date <= endDate);

    res.json({ ...tracker.toObject(), entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/trackers/:id/entry
exports.addOrUpdateEntry = async (req, res) => {
  try {
    const { date, values } = req.body;

    if (global.useJsonDb) {
      const tracker = await jsonDb.trackers.findById(req.params.id);
      if (!tracker) return res.status(404).json({ message: "Tracker not found" });

      const existingIdx = tracker.entries.findIndex((e) => e.date === date);
      const entryData = {
        date,
        values: values || {},
        createdBy: req.user.id,
      };

      if (existingIdx >= 0) {
        tracker.entries[existingIdx] = { ...tracker.entries[existingIdx], ...entryData };
      } else {
        tracker.entries.push(entryData);
      }

      await jsonDb.trackers.update(tracker._id, { entries: tracker.entries });
      return res.json(tracker);
    }

    const tracker = await Tracker.findById(req.params.id);
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });

    const existingEntry = tracker.entries.find((e) => e.date === date);
    if (existingEntry) {
      existingEntry.values = values || {};
      existingEntry.createdBy = req.user.id;
    } else {
      tracker.entries.push({ date, values: values || {}, createdBy: req.user.id });
    }

    await tracker.save();
    res.json(tracker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trackers/:id
exports.deleteTracker = async (req, res) => {
  try {
    if (global.useJsonDb) {
      const tracker = await jsonDb.trackers.findById(req.params.id);
      if (!tracker) return res.status(404).json({ message: "Tracker not found" });
      if (tracker.creator !== req.user.id) {
        return res.status(403).json({ message: "Only the creator can delete this tracker" });
      }
      await jsonDb.trackers.delete(req.params.id);
      return res.json({ message: "Tracker deleted" });
    }

    const tracker = await Tracker.findById(req.params.id);
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });
    if (tracker.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the creator can delete this tracker" });
    }
    await Tracker.findByIdAndDelete(req.params.id);
    res.json({ message: "Tracker deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trackers/:id/report
exports.getTrackerReport = async (req, res) => {
  try {
    let tracker;

    if (global.useJsonDb) {
      tracker = await jsonDb.trackers.findById(req.params.id);
    } else {
      tracker = await Tracker.findById(req.params.id);
    }

    if (!tracker) return res.status(404).json({ message: "Tracker not found" });

    const entries = tracker.entries || [];
    const headings = tracker.headings || [];
    const type = tracker.type;

    const now = new Date();
    let currentStart, currentEnd, prevStart, prevEnd;

    if (type === "daily") {
      const todayStr = now.toISOString().slice(0, 10);
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      currentStart = d.toISOString().slice(0, 10);
      currentEnd = todayStr;
      d.setDate(d.getDate() - 7);
      prevStart = d.toISOString().slice(0, 10);
      prevEnd = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    } else if (type === "weekly") {
      const dayOfWeek = now.getDay();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - dayOfWeek);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      currentStart = weekStart.toISOString().slice(0, 10);
      currentEnd = weekEnd.toISOString().slice(0, 10);
      const prevWeekEnd = new Date(weekStart);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
      const prevWeekStart = new Date(prevWeekEnd);
      prevWeekStart.setDate(prevWeekStart.getDate() - 6);
      prevStart = prevWeekStart.toISOString().slice(0, 10);
      prevEnd = prevWeekEnd.toISOString().slice(0, 10);
    } else {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthEnd = new Date(monthStart.getTime() - 1);
      const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
      currentStart = monthStart.toISOString().slice(0, 10);
      currentEnd = now.toISOString().slice(0, 10);
      prevStart = prevMonthStart.toISOString().slice(0, 10);
      prevEnd = prevMonthEnd.toISOString().slice(0, 10);
    }

    const currentEntries = entries.filter((e) => e.date >= currentStart && e.date <= currentEnd);
    const prevEntries = entries.filter((e) => e.date >= prevStart && e.date <= prevEnd);

    const calcStats = (ents) => {
      if (!ents.length || !headings.length) return { overall: 0, perHeading: {} };
      let totalChecks = 0;
      let totalDone = 0;
      const perHeading = {};
      headings.forEach((h) => {
        perHeading[h] = { total: 0, done: 0 };
      });
      ents.forEach((entry) => {
        const vals = entry.values instanceof Map ? Object.fromEntries(entry.values) : (entry.values || {});
        headings.forEach((h) => {
          const v = vals[h];
          if (v) {
            perHeading[h].total++;
            totalChecks++;
            if (v.checked) {
              perHeading[h].done++;
              totalDone++;
            }
          }
        });
      });
      return {
        overall: totalChecks > 0 ? Math.round((totalDone / totalChecks) * 100) : 0,
        perHeading,
      };
    };

    const currentStats = calcStats(currentEntries);
    const prevStats = calcStats(prevEntries);

    const perHeading = headings.map((h) => {
      const cur = currentStats.perHeading[h] || { total: 0, done: 0 };
      const prev = prevStats.perHeading[h] || { total: 0, done: 0 };
      const curPct = cur.total > 0 ? Math.round((cur.done / cur.total) * 100) : 0;
      const prevPct = prev.total > 0 ? Math.round((prev.done / prev.total) * 100) : 0;
      const diff = curPct - prevPct;
      let trend = "same";
      let message = "No change from last period.";
      if (diff > 5) { trend = "up"; message = `Improved by ${diff}%. Keep it up!`; }
      else if (diff < -5) { trend = "down"; message = `Dropped by ${Math.abs(diff)}%. Needs attention.`; }
      return { name: h, current: curPct, previous: prevPct, trend, message };
    });

    const overallDiff = currentStats.overall - prevStats.overall;
    let summary;
    if (overallDiff > 0) {
      summary = `You completed ${currentStats.overall}% this period vs ${prevStats.overall}% last period (+${overallDiff}%). Great progress!`;
    } else if (overallDiff < 0) {
      summary = `You completed ${currentStats.overall}% this period vs ${prevStats.overall}% last period (${overallDiff}%). Let's focus on improvement.`;
    } else {
      summary = `You completed ${currentStats.overall}% this period, same as last period. Try to push higher!`;
    }

    const lowHeadings = perHeading.filter((h) => h.trend === "down" || h.current < 50);
    let recommendation = "Maintain your current pace across all areas.";
    if (lowHeadings.length > 0) {
      const names = lowHeadings.map((h) => h.name).join(", ");
      recommendation = `Focus more on: ${names}. These areas need attention.`;
    }
    if (currentStats.overall >= 90 && lowHeadings.length === 0) {
      recommendation = "Excellent work across all areas! Maintain this momentum.";
    }

    res.json({
      period: { start: currentStart, end: currentEnd },
      previousPeriod: { start: prevStart, end: prevEnd },
      currentOverall: currentStats.overall,
      previousOverall: prevStats.overall,
      summary,
      perHeading,
      recommendation,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
