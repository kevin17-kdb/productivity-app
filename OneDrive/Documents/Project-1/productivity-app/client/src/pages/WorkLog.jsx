import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Users,
} from "lucide-react";

const toLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateShort = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const WorkLog = () => {
  const {
    workLog,
    workLogHistory,
    fetchWorkLog,
    addWorkLogEntry,
    removeWorkLogEntry,
    updateWorkLogReflection,
    fetchWorkLogHistory,
    currentWorkspace,
    getCurrentUserRole,
    user,
  } = useApp();

  const today = toLocalDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newEntry, setNewEntry] = useState("");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const userRole = getCurrentUserRole();
  const canViewOthers = userRole === "Architect" || userRole === "Planner";

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkLog(selectedDate, selectedUserId || undefined);
      fetchWorkLogHistory();
    }
  }, [selectedDate, selectedUserId, currentWorkspace]);

  useEffect(() => {
    if (workLog) {
      setReflection(workLog.reflection || "");
    }
  }, [workLog]);

  const navigateDay = (direction) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + direction);
    if (toLocalDate(d) <= today) {
      setSelectedDate(toLocalDate(d));
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;
    setSaving(true);
    try {
      await addWorkLogEntry(selectedDate, newEntry.trim());
      setNewEntry("");
    } catch (err) {
      alert("Failed to add entry: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEntry = async (index) => {
    try {
      await removeWorkLogEntry(selectedDate, index);
    } catch (err) {
      alert("Failed to remove entry: " + err.message);
    }
  };

  const handleSaveReflection = async () => {
    setSaving(true);
    try {
      await updateWorkLogReflection(selectedDate, reflection);
    } catch (err) {
      alert("Failed to save reflection: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isToday = selectedDate === today;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Work Log</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Write what you accomplished each day. Your private record of progress.
        </p>
      </div>

      {/* Date Navigation */}
      <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigateDay(-1)}
          style={{ padding: "8px" }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: "1.15rem", fontWeight: 700 }}>
            {formatDisplayDate(selectedDate)}
          </p>
          {isToday && (
            <span className="badge" style={{ background: "var(--color-primary)", color: "white", marginTop: "4px" }}>
              Today
            </span>
          )}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigateDay(1)}
          disabled={isToday}
          style={{ padding: "8px", opacity: isToday ? 0.3 : 1, cursor: isToday ? "not-allowed" : "pointer" }}
        >
          <ChevronRight size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={14} color="var(--text-muted)" />
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "6px 10px", fontSize: "0.85rem", width: "150px" }}
          />
        </div>

        {canViewOthers && currentWorkspace && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={14} color="var(--text-muted)" />
            <select
              className="input-field"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ padding: "6px 10px", fontSize: "0.85rem", width: "150px" }}
            >
              <option value="">My Log</option>
              {currentWorkspace.members
                .filter((m) => m.user._id !== user._id)
                .map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Entries Section */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} /> Work Entries
          </h2>

          {/* Entry List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "100px" }}>
            {workLog && workLog.entries && workLog.entries.length > 0 ? (
              workLog.entries.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <span style={{ color: "var(--color-primary)", marginTop: "2px" }}>✓</span>
                  <p style={{ flex: 1, fontSize: "0.95rem", lineHeight: "1.5" }}>{entry.content}</p>
                  <button
                    onClick={() => handleRemoveEntry(idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-subtle)",
                      padding: "2px",
                    }}
                    title="Remove entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--text-subtle)" }}>
                <Clock size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
                <p style={{ fontSize: "0.9rem" }}>No entries for this day.</p>
                <p style={{ fontSize: "0.8rem" }}>Add what you accomplished below.</p>
              </div>
            )}
          </div>

          {/* Add Entry */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="input-field"
              placeholder="What did you accomplish?"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
              style={{ flex: 1, padding: "10px 14px" }}
            />
            <button
              className="btn btn-primary"
              onClick={handleAddEntry}
              disabled={saving || !newEntry.trim()}
              style={{ padding: "10px 14px" }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Entry Count */}
          {workLog && workLog.entries && workLog.entries.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", textAlign: "right" }}>
              {workLog.entries.length} {workLog.entries.length === 1 ? "entry" : "entries"}
            </p>
          )}
        </div>

        {/* Reflection Section */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} /> End of Day Reflection
          </h2>

          <textarea
            className="input-field"
            rows={6}
            placeholder="How did today go? What went well? What could improve? (Optional)"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            style={{ resize: "vertical" }}
          />

          <button
            className="btn btn-primary"
            onClick={handleSaveReflection}
            disabled={saving}
            style={{ padding: "10px", width: "100%" }}
          >
            {saving ? "Saving..." : "Save Reflection"}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={18} /> Recent History
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "250px", overflowY: "auto" }}>
          {workLogHistory.length > 0 ? (
            workLogHistory.map((log) => (
              <button
                key={log._id || log.date}
                onClick={() => setSelectedDate(log.date)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: selectedDate === log.date ? "var(--bg-active)" : "var(--bg-input)",
                  border: selectedDate === log.date ? "1px solid var(--color-primary)" : "1px solid var(--border-glass)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                  {formatDateShort(log.date)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {log.entries ? log.entries.length : 0} {log.entries?.length === 1 ? "entry" : "entries"}
                  {log.reflection ? " · reflected" : ""}
                </span>
              </button>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "var(--text-subtle)", padding: "16px", fontSize: "0.9rem" }}>
              No history yet. Start logging your work!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
