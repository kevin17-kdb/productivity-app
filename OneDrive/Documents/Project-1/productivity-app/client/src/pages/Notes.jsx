import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StickyNote, Plus, Trash2, Edit3, Save, X, Tag } from "lucide-react";

export const Notes = () => {
  const { notes, fetchNotes, createNote, updateNote, deleteNote, currentWorkspace } = useApp();
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [filterType, setFilterType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentWorkspace) fetchNotes(filterType || undefined);
  }, [currentWorkspace, filterType]);

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await createNote(newContent.trim(), newTags);
      setNewContent("");
      setNewTags([]);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await updateNote(id, editContent.trim());
      setEditingId(null);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this note?")) {
      await deleteNote(id);
    }
  };

  const addTag = (type) => {
    setNewTags([...newTags, { type, refId: null, label: "" }]);
  };

  const updateTagLabel = (idx, label) => {
    const updated = [...newTags];
    updated[idx] = { ...updated[idx], label };
    setNewTags(updated);
  };

  const removeTag = (idx) => {
    setNewTags(newTags.filter((_, i) => i !== idx));
  };

  const tagColors = {
    task: { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
    reminder: { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
    tracker: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Private Notes</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Your personal notes, tagged to tasks, reminders, or trackers. Only you can see these.
        </p>
      </div>

      {/* New Note */}
      <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Write a private note..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          style={{ resize: "vertical" }}
        />

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <Tag size={14} color="var(--text-muted)" />
          {newTags.map((tag, idx) => {
            const style = tagColors[tag.type] || tagColors.task;
            return (
              <span
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  background: style.bg,
                  color: style.color,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {tag.type}
                <input
                  type="text"
                  placeholder="label"
                  value={tag.label}
                  onChange={(e) => updateTagLabel(idx, e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: style.color,
                    fontSize: "0.75rem",
                    width: "60px",
                    outline: "none",
                  }}
                />
                <button onClick={() => removeTag(idx)} style={{ background: "transparent", border: "none", cursor: "pointer", color: style.color, padding: 0 }}>
                  <X size={10} />
                </button>
              </span>
            );
          })}
          <div style={{ display: "flex", gap: "4px" }}>
            {["task", "reminder", "tracker"].map((type) => (
              <button
                key={type}
                onClick={() => addTag(type)}
                style={{
                  background: tagColors[type].bg,
                  color: tagColors[type].color,
                  border: "none",
                  borderRadius: "8px",
                  padding: "2px 8px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={saving || !newContent.trim()}
          style={{ padding: "10px", width: "100%" }}
        >
          <Plus size={16} /> {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { value: "", label: "All" },
          { value: "task", label: "Tasks" },
          { value: "reminder", label: "Reminders" },
          { value: "tracker", label: "Trackers" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className="btn btn-secondary"
            style={{
              padding: "6px 12px",
              fontSize: "0.8rem",
              background: filterType === f.value ? "var(--bg-active)" : undefined,
              color: filterType === f.value ? "var(--color-primary)" : undefined,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              className="glass-panel"
              style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {editingId === note._id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="btn btn-primary" onClick={() => handleUpdate(note._id)} disabled={saving} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                      <Save size={12} /> Save
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{note.content}</p>

                  {note.tags && note.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {note.tags.map((tag, idx) => {
                        const style = tagColors[tag.type] || tagColors.task;
                        return (
                          <span
                            key={idx}
                            style={{
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: style.bg,
                              color: style.color,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {tag.type}{tag.label ? `: ${tag.label}` : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => { setEditingId(note._id); setEditContent(note.content); }}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: "4px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-subtle)" }}>
            <StickyNote size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <p style={{ fontSize: "0.9rem" }}>No private notes yet. Write your first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
