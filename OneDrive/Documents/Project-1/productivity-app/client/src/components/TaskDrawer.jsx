import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Paperclip, Trash2, Save, Globe, Calendar, User, Clock, Flag } from "lucide-react";

export const TaskDrawer = ({ task, onClose }) => {
  const {
    deleteTask,
    updateTask,
    addTaskAttachment,
    saveTaskPrivateNote,
    currentWorkspace,
    getCurrentUserRole,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editCategory, setEditCategory] = useState(task.category);
  const [editPriority, setEditPriority] = useState(task.priority || "medium");
  const [editDeadline, setEditDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
  );
  const [editAssignedTo, setEditAssignedTo] = useState(task.assignedTo?._id || "");

  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");

  const userRole = getCurrentUserRole();
  const isArchitect = userRole === "Architect";
  const canEdit = isArchitect || userRole === "Planner";

  useEffect(() => {
    if (task && task.privateNotes && task.privateNotes.length > 0) {
      setPrivateNote(task.privateNotes[0].content || "");
    } else {
      setPrivateNote("");
    }
    setNoteStatus("");
    setEditing(false);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditPriority(task.priority || "medium");
    setEditDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "");
    setEditAssignedTo(task.assignedTo?._id || "");
  }, [task]);

  const handleSaveEdit = async () => {
    try {
      await updateTask(task._id, {
        title: editTitle,
        category: editCategory,
        priority: editPriority,
        deadline: editDeadline ? new Date(editDeadline) : undefined,
        assignedTo: editAssignedTo || undefined,
      });
      setEditing(false);
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) return;
    try {
      await addTaskAttachment(task._id, fileName, fileUrl);
      setFileName("");
      setFileUrl("");
    } catch (err) {
      alert("Error adding attachment: " + err.message);
    }
  };

  const handleSavePrivateNote = async () => {
    setNoteStatus("Saving...");
    try {
      await saveTaskPrivateNote(task._id, privateNote);
      setNoteStatus("Saved!");
      setTimeout(() => setNoteStatus(""), 2000);
    } catch (err) {
      setNoteStatus("Error saving");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this task?")) {
      try {
        await deleteTask(task._id);
        onClose();
      } catch (err) {
        alert("Deletion failed: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const priorityColors = {
    low: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
    medium: { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
    high: { bg: "rgba(239, 68, 68, 0.15)", color: "#f87171" },
  };

  const pStyle = priorityColors[task.priority] || priorityColors.medium;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 1999 }} />

      <div
        className="animate-slide-in"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "450px",
          maxWidth: "92vw",
          background: "var(--bg-sidebar)",
          borderLeft: "1px solid var(--border-glass)",
          zIndex: 2000,
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Task Details</h3>
          <div style={{ display: "flex", gap: "6px" }}>
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "0.8rem" }}>
                Edit
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary" style={{ padding: "6px" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Title & Info */}
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              className="input-field"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ fontSize: "1.1rem", fontWeight: 700 }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Category</label>
                <select className="input-field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ padding: "8px" }}>
                  <option value="Studying">Studying</option>
                  <option value="Health">Health</option>
                  <option value="Work">Work</option>
                  <option value="Leisure">Leisure</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Priority</label>
                <select className="input-field" value={editPriority} onChange={(e) => setEditPriority(e.target.value)} style={{ padding: "8px" }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Deadline</label>
              <input type="datetime-local" className="input-field" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} style={{ padding: "8px" }} />
            </div>
            {currentWorkspace && (
              <div className="input-group">
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Assign To</label>
                <select className="input-field" value={editAssignedTo} onChange={(e) => setEditAssignedTo(e.target.value)} style={{ padding: "8px" }}>
                  <option value="">Unassigned</option>
                  {currentWorkspace.members.map((m) => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={handleSaveEdit} style={{ flex: 1, padding: "10px" }}>
                <Save size={14} /> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{task.title}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-muted)", fontSize: "0.7rem" }}>
                {task.type.toUpperCase()}
              </span>
              <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-muted)", fontSize: "0.7rem" }}>
                {task.category}
              </span>
              <span className="badge" style={{ background: pStyle.bg, color: pStyle.color, fontSize: "0.7rem" }}>
                <Flag size={10} /> {task.priority || "medium"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {task.deadline && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={14} /> Deadline: {new Date(task.deadline).toLocaleString()}
                </span>
              )}
              {task.assignedTo && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={14} /> Assigned to: {task.assignedTo.name}
                </span>
              )}
              {task.hourSlot && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} /> Time slot: {task.hourSlot}
                </span>
              )}
            </div>
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)" }} />

        {/* Private Notes */}
        <div style={{ padding: "14px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary)" }}>Private Memo</span>
            {noteStatus && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{noteStatus}</span>}
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginBottom: "8px" }}>
            Only you can see this. Not even admins can read it.
          </p>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Private notes about this task..."
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            style={{ resize: "vertical", fontSize: "0.85rem" }}
          />
          <button className="btn btn-primary" onClick={handleSavePrivateNote} style={{ width: "100%", padding: "8px", fontSize: "0.8rem", marginTop: "8px" }}>
            <Save size={12} /> Save Memo
          </button>
        </div>

        {/* Attachments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem" }}>
            <Paperclip size={16} /> Attachments
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {task.attachments && task.attachments.length > 0 ? (
              task.attachments.map((file, idx) => (
                <div key={idx} style={{ padding: "8px 12px", background: "var(--bg-input)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Globe size={14} color="var(--color-primary)" />
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-main)", textDecoration: "none", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.fileName}
                  </a>
                </div>
              ))
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>No attachments</span>
            )}
          </div>
          <form onSubmit={handleAddAttachment} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input type="text" required className="input-field" placeholder="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} style={{ padding: "8px", fontSize: "0.85rem" }} />
            <div style={{ display: "flex", gap: "6px" }}>
              <input type="url" required className="input-field" placeholder="URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} style={{ padding: "8px", fontSize: "0.85rem" }} />
              <button type="submit" className="btn btn-secondary" style={{ padding: "8px" }}>Add</button>
            </div>
          </form>
        </div>

        {/* Delete */}
        {isArchitect && (
          <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
            <button className="btn btn-danger" onClick={handleDelete} style={{ width: "100%", padding: "10px" }}>
              <Trash2 size={16} /> Delete Task
            </button>
          </div>
        )}
      </div>
    </>
  );
};
