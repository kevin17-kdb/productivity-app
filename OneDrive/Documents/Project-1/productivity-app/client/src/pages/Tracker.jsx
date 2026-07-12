import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Plus, X, BarChart3 } from "lucide-react";
import { TrackerCard } from "../components/TrackerCard";

export const Tracker = () => {
  const { trackers, fetchTrackers, createTracker, currentWorkspace } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("daily");
  const [visibility, setVisibility] = useState("personal");
  const [headings, setHeadings] = useState([""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentWorkspace) fetchTrackers();
  }, [currentWorkspace]);

  const handleAddHeading = () => setHeadings([...headings, ""]);
  const handleRemoveHeading = (idx) => setHeadings(headings.filter((_, i) => i !== idx));
  const handleHeadingChange = (idx, val) => {
    const updated = [...headings];
    updated[idx] = val;
    setHeadings(updated);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const filtered = headings.filter((h) => h.trim());
    if (!name.trim() || filtered.length === 0) return;
    setSaving(true);
    try {
      await createTracker({ name: name.trim(), type, visibility, headings: filtered });
      setName("");
      setType("daily");
      setVisibility("personal");
      setHeadings([""]);
      setShowCreate(false);
    } catch (err) {
      alert("Failed to create tracker: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Trackers</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Create personal or shared trackers with custom categories and monitor progress.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ padding: "10px 16px" }}>
          <Plus size={16} /> New Tracker
        </button>
      </div>

      {/* Tracker List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {trackers.length > 0 ? (
          trackers.map((tracker) => <TrackerCard key={tracker._id} tracker={tracker} />)
        ) : (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-subtle)" }}>
            <BarChart3 size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <p style={{ fontSize: "1rem", fontWeight: 600 }}>No trackers yet</p>
            <p style={{ fontSize: "0.85rem" }}>Create your first tracker to start monitoring habits and goals.</p>
          </div>
        )}
      </div>

      {/* Create Tracker Modal */}
      {showCreate && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "460px", maxWidth: "95vw", padding: "24px", background: "var(--bg-app)", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Plus size={20} /> New Tracker</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group">
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Tracker Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Daily Health, Weekly Study Plan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Type</label>
                  <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Visibility</label>
                  <select className="input-field" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="personal">Personal</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Categories / Columns</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {headings.map((h, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder={`Category ${idx + 1} (e.g., Studying, Health)`}
                        value={h}
                        onChange={(e) => handleHeadingChange(idx, e.target.value)}
                        style={{ flex: 1, padding: "8px 12px" }}
                      />
                      {headings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHeading(idx)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: "4px" }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddHeading}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px dashed var(--border-glass)",
                      borderRadius: "8px",
                      padding: "8px",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <Plus size={14} /> Add Category
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || !name.trim() || headings.filter((h) => h.trim()).length === 0} style={{ flex: 1 }}>
                  {saving ? "Creating..." : "Create Tracker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
