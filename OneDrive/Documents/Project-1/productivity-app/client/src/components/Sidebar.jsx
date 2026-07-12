import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  FolderPlus, 
  UserPlus, 
  LogOut, 
  LayoutDashboard, 
  BookOpen,
  BarChart3,
  StickyNote,
  Smile, 
  BrainCircuit, 
  Users,
  Settings,
  X,
  Trash2
} from "lucide-react";
import { ThemePicker } from "./ThemePicker";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const {
    user,
    theme,
    setThemeByName,
    workspaces,
    currentWorkspace,
    selectWorkspace,
    createWorkspace,
    addWorkspaceMember,
    removeWorkspaceMember,
    updateMemberRole,
    getCurrentUserRole,
    logout
  } = useApp();

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Contributor");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      await createWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
    } catch (err) {
      alert("Error creating workspace: " + err.message);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      // Find user on backend by email. For mock simplicity, we pass inviteEmail.
      // In a real app we'd search users, here we just pass the inviteEmail as userId representation 
      // or invite standard user. We'll alert user.
      alert("Inviting member " + inviteEmail + " as " + inviteRole);
      // Calls addWorkspaceMember with dummy userId. In real app, search user first.
      await addWorkspaceMember(inviteEmail, inviteRole);
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (err) {
      alert("Invitation failed: " + err.message);
    }
  };

  const userRole = getCurrentUserRole();

  return (
    <div className="sidebar" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Top Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* App Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BrainCircuit size={28} color="var(--color-primary)" />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, background: "linear-gradient(to right, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Viora
          </h2>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="glass-panel" style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button 
            className="btn" 
            onClick={() => setActiveTab("dashboard")} 
            style={{ 
              justifyContent: "flex-start", 
              background: activeTab === "dashboard" ? "var(--bg-active)" : "transparent",
              color: activeTab === "dashboard" ? "var(--color-primary)" : "var(--text-main)"
            }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab("worklog")} 
            style={{ 
              justifyContent: "flex-start", 
              background: activeTab === "worklog" ? "var(--bg-active)" : "transparent",
              color: activeTab === "worklog" ? "var(--color-primary)" : "var(--text-main)"
            }}
          >
            <BookOpen size={18} /> Work Log
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab("tracker")} 
            style={{ 
              justifyContent: "flex-start", 
              background: activeTab === "tracker" ? "var(--bg-active)" : "transparent",
              color: activeTab === "tracker" ? "var(--color-primary)" : "var(--text-main)"
            }}
          >
            <BarChart3 size={18} /> Trackers
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab("notes")} 
            style={{ 
              justifyContent: "flex-start", 
              background: activeTab === "notes" ? "var(--bg-active)" : "transparent",
              color: activeTab === "notes" ? "var(--color-primary)" : "var(--text-main)"
            }}
          >
            <StickyNote size={18} /> Private Notes
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab("mood")}
            style={{ 
              justifyContent: "flex-start", 
              background: activeTab === "mood" ? "var(--bg-active)" : "transparent",
              color: activeTab === "mood" ? "var(--color-primary)" : "var(--text-main)"
            }}
          >
            <Smile size={18} /> Mood Diary
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab("analytics")} 
            style={{ 
              justifyContent: "flex-start", 
              background: activeTab === "analytics" ? "var(--bg-active)" : "transparent",
              color: activeTab === "analytics" ? "var(--color-primary)" : "var(--text-main)"
            }}
          >
            <BrainCircuit size={18} /> AI Coach
          </button>
        </div>

        {/* Workspace Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Workspaces</p>
          
          <select 
            className="input-field" 
            value={currentWorkspace ? currentWorkspace._id : ""} 
            onChange={(e) => {
              const ws = workspaces.find(w => w._id === e.target.value);
              if (ws) selectWorkspace(ws);
            }}
            style={{ padding: "8px 12px" }}
          >
            {workspaces.map(w => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
            {workspaces.length === 0 && <option value="">No Workspaces</option>}
          </select>

          {/* Create Workspace Form */}
          <form onSubmit={handleCreateWorkspace} style={{ display: "flex", gap: "6px" }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="New Workspace..." 
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              style={{ padding: "8px", fontSize: "0.85rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "8px" }}>
              <FolderPlus size={16} />
            </button>
          </form>
        </div>

        {/* Invite Member Section (Visible to Architect Only) */}
        {currentWorkspace && userRole === "Architect" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Workspace Settings</p>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowInviteModal(true)}
              style={{ fontSize: "0.85rem", padding: "8px", width: "100%", justifyContent: "center" }}
            >
              <UserPlus size={14} /> Invite Member
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowMemberModal(true)}
              style={{ fontSize: "0.85rem", padding: "8px", width: "100%", justifyContent: "center" }}
            >
              <Settings size={14} /> Manage Members
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Role Display */}
        {currentWorkspace && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span>Workspace Role:</span>
            <span className={`badge badge-${userRole}`}>{userRole}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <ThemePicker currentTheme={theme} onThemeChange={setThemeByName} />
          <button className="btn btn-danger" onClick={logout} style={{ padding: "10px" }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "380px", padding: "24px", background: "var(--bg-app)" }}>
            <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Users size={20} /> Invite Workspace Member</h3>
            <form onSubmit={handleInviteMember} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="input-group">
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Member Email</label>
                <input 
                  type="email" 
                  required
                  className="input-field" 
                  placeholder="name@gmail.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Role Assignment</label>
                <select 
                  className="input-field" 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="Architect">Architect (Admin - Full Access)</option>
                  <option value="Planner">Planner (Moderator - Add/Assign/Edit)</option>
                  <option value="Contributor">Contributor (Person - Mark Completion)</option>
                  <option value="Observer">Observer (Viewer - Read Only)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && currentWorkspace && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "400px", maxWidth: "92vw", padding: "24px", background: "var(--bg-app)", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Users size={20} /> Manage Members</h3>
              <button onClick={() => setShowMemberModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            {currentWorkspace.members.map((m) => (
              <div
                key={m.user._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0 }}>
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{m.user.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.user.email}</p>
                </div>
                <select
                  className="input-field"
                  value={m.role}
                  onChange={(e) => updateMemberRole(m.user._id, e.target.value)}
                  style={{ padding: "4px 6px", fontSize: "0.75rem", width: "110px" }}
                >
                  <option value="Architect">Architect</option>
                  <option value="Planner">Planner</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Observer">Observer</option>
                </select>
                {m.user._id !== user._id && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${m.user.name} from this workspace?`)) {
                        removeWorkspaceMember(m.user._id);
                      }
                    }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: "4px" }}
                    title="Remove member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
