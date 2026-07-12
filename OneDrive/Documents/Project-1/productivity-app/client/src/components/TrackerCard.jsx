import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  CheckSquare,
  Trash2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

const toLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getProgressColor = (pct) => {
  if (pct < 40) return "var(--progress-red)";
  if (pct < 70) return "var(--progress-orange)";
  if (pct < 90) return "var(--progress-violet)";
  return "var(--progress-blue)";
};

export const TrackerCard = ({ tracker }) => {
  const { saveTrackerEntry, deleteTracker, getTrackerReport, user } = useApp();
  const [entries, setEntries] = useState(tracker.entries || []);
  const [expanded, setExpanded] = useState(false);
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const isCreator = tracker.creator === user?._id || tracker.creator?._id === user?._id;

  const generateDates = () => {
    const dates = [];
    const now = new Date();
    const count = tracker.type === "daily" ? 7 : tracker.type === "weekly" ? 4 : 30;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      if (tracker.type === "daily") {
        d.setDate(d.getDate() - i);
      } else if (tracker.type === "weekly") {
        d.setDate(d.getDate() - i * 7);
      } else {
        d.setDate(d.getDate() - i);
      }
      dates.push(toLocalDate(d));
    }
    return dates;
  };

  const dates = generateDates();

  const getEntryValues = (date) => {
    const entry = entries.find((e) => e.date === date);
    if (!entry) return {};
    return entry.values instanceof Map ? Object.fromEntries(entry.values) : (entry.values || {});
  };

  const handleToggle = async (date, heading) => {
    const current = getEntryValues(date);
    const newVal = { checked: !(current[heading]?.checked), note: current[heading]?.note || "" };
    const updatedValues = { ...current, [heading]: newVal };

    setEntries((prev) => {
      const existing = prev.find((e) => e.date === date);
      if (existing) {
        return prev.map((e) => (e.date === date ? { ...e, values: updatedValues } : e));
      }
      return [...prev, { date, values: updatedValues }];
    });

    try {
      await saveTrackerEntry(tracker._id, date, updatedValues);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const handleNoteChange = async (date, heading, note) => {
    const current = getEntryValues(date);
    const newVal = { checked: current[heading]?.checked || false, note };
    const updatedValues = { ...current, [heading]: newVal };

    setEntries((prev) => {
      const existing = prev.find((e) => e.date === date);
      if (existing) {
        return prev.map((e) => (e.date === date ? { ...e, values: updatedValues } : e));
      }
      return [...prev, { date, values: updatedValues }];
    });

    try {
      await saveTrackerEntry(tracker._id, date, updatedValues);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const calcProgress = () => {
    let total = 0;
    let done = 0;
    entries.forEach((entry) => {
      const vals = entry.values instanceof Map ? Object.fromEntries(entry.values) : (entry.values || {});
      tracker.headings.forEach((h) => {
        if (vals[h]) {
          total++;
          if (vals[h].checked) done++;
        }
      });
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const handleReport = async () => {
    if (showReport) {
      setShowReport(false);
      return;
    }
    setLoadingReport(true);
    try {
      const data = await getTrackerReport(tracker._id);
      setReport(data);
      setShowReport(true);
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${tracker.name}"? This cannot be undone.`)) {
      await deleteTracker(tracker._id);
    }
  };

  const progress = calcProgress();
  const progressColor = getProgressColor(progress);

  return (
    <div className="glass-panel" style={{ overflow: "hidden" }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckSquare size={18} color="var(--color-primary)" />
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{tracker.name}</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
              <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-muted)", fontSize: "0.65rem" }}>
                {tracker.type}
              </span>
              <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-muted)", fontSize: "0.65rem" }}>
                {tracker.visibility}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: progressColor }}>{progress}%</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Progress bar */}
      <div style={{ padding: "0 20px" }}>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: progressColor }} />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Tracker Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border-glass)", minWidth: "80px" }}>
                    {tracker.type === "daily" ? "Date" : tracker.type === "weekly" ? "Week of" : "Day"}
                  </th>
                  {tracker.headings.map((h) => (
                    <th key={h} style={{ padding: "8px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border-glass)", minWidth: "90px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => {
                  const vals = getEntryValues(date);
                  return (
                    <tr key={date}>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border-glass)", fontWeight: 500, color: "var(--text-main)", whiteSpace: "nowrap" }}>
                        {new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      {tracker.headings.map((h) => {
                        const cellVal = vals[h] || { checked: false, note: "" };
                        return (
                          <td key={h} style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid var(--border-glass)" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                              <button
                                onClick={() => handleToggle(date, h)}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "6px",
                                  border: cellVal.checked ? "2px solid var(--color-primary)" : "2px solid var(--border-glass)",
                                  background: cellVal.checked ? "var(--color-primary)" : "transparent",
                                  color: cellVal.checked ? "white" : "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.9rem",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {cellVal.checked ? "✓" : ""}
                              </button>
                              <input
                                type="text"
                                placeholder="note"
                                value={cellVal.note || ""}
                                onChange={(e) => handleNoteChange(date, h, e.target.value)}
                                style={{
                                  width: "70px",
                                  padding: "2px 4px",
                                  fontSize: "0.7rem",
                                  background: "var(--bg-input)",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "4px",
                                  color: "var(--text-main)",
                                  textAlign: "center",
                                  outline: "none",
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={handleReport} style={{ fontSize: "0.85rem", padding: "8px 12px" }}>
              <BarChart3 size={14} /> {showReport ? "Hide Report" : "View Report"}
            </button>
            {isCreator && (
              <button className="btn btn-danger" onClick={handleDelete} style={{ fontSize: "0.85rem", padding: "8px 12px" }}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>

          {/* Report Section */}
          {showReport && report && (
            <div className="glass-panel" style={{ padding: "16px", background: "var(--bg-input)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem" }}>
                <BarChart3 size={16} color="var(--color-primary)" /> Comparison Report
              </h4>
              <p style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>{report.summary}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {report.perHeading.map((h) => (
                  <div key={h.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: 600, minWidth: "80px" }}>{h.name}</span>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar-container" style={{ height: "6px" }}>
                        <div className="progress-bar-fill" style={{ width: `${h.current}%`, background: getProgressColor(h.current) }} />
                      </div>
                    </div>
                    <span style={{ color: h.trend === "up" ? "#10b981" : h.trend === "down" ? "#ef4444" : "var(--text-muted)", fontWeight: 600, minWidth: "36px" }}>
                      {h.current}%
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", flex: 1 }}>{h.message}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-panel)", border: "1px solid var(--border-glass)" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} /> {report.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
