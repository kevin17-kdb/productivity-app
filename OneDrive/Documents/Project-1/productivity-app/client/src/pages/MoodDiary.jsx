import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Smile, MessageSquareHeart, History, Heart, Users, Calendar } from "lucide-react";
import axios from "axios";

export const MoodDiary = () => {
  const {
    moodLogs,
    addMoodLog,
    fetchMoodLogs,
    currentWorkspace,
    getCurrentUserRole
  } = useApp();

  const [score, setScore] = useState(3);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentAIResponse, setRecentAIResponse] = useState("");

  // Admin view mood logs of other users
  const [selectedMember, setSelectedMember] = useState("");
  const [memberLogs, setMemberLogs] = useState([]);
  const [loadingMemberLogs, setLoadingMemberLogs] = useState(false);

  const userRole = getCurrentUserRole();
  const isArchitect = userRole === "Architect";

  useEffect(() => {
    fetchMoodLogs();
  }, []);

  const emojis = [
    { value: 1, char: "😢", label: "Awful", color: "#f87171" },
    { value: 2, char: "😕", label: "Stressed", color: "#fbbf24" },
    { value: 3, char: "😐", label: "Okay", color: "#a78bfa" },
    { value: 4, char: "🙂", label: "Good", color: "#34d399" },
    { value: 5, char: "😄", label: "Excellent", color: "#60a5fa" }
  ];

  const handleAddMood = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecentAIResponse("");
    try {
      const res = await addMoodLog(score, reason);
      setRecentAIResponse(res.aiResponse);
      setReason("");
    } catch (err) {
      alert("Failed to save mood log: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMemberLogs = async (memberId) => {
    setSelectedMember(memberId);
    if (!memberId) {
      setMemberLogs([]);
      return;
    }
    setLoadingMemberLogs(true);
    try {
      const res = await axios.get(`/api/moods/user?workspaceId=${currentWorkspace._id}&targetUserId=${memberId}`);
      setMemberLogs(res.data);
    } catch (err) {
      console.error("Error loading member logs:", err);
      alert("Failed to retrieve member logs: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingMemberLogs(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mood Space</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Track your emotional well-being and receive compassionate AI recommendations
        </p>
      </div>

      <div className="dashboard-grid">
        
        {/* Log Mood Section */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Heart size={20} color="var(--progress-red)" /> Log Your Mood
          </h2>
          
          <form onSubmit={handleAddMood} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Emojis Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>How are you feeling right now?</label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "4px" }}>
                {emojis.map((emoji) => (
                  <button
                    key={emoji.value}
                    type="button"
                    onClick={() => setScore(emoji.value)}
                    style={{
                      background: score === emoji.value ? "var(--bg-active)" : "transparent",
                      border: score === emoji.value ? `2px solid ${emoji.color}` : "2px solid var(--border-glass)",
                      borderRadius: "14px",
                      padding: "12px",
                      flex: 1,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: "1.8rem" }}>{emoji.char}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: score === emoji.value ? emoji.color : "var(--text-muted)" }}>
                      {emoji.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Text */}
            <div className="input-group">
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>What is causing this feeling? (Optional)</label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="e.g. Stressed about my upcoming midterm, or had a refreshing run this morning!"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "12px", width: "100%", fontWeight: 700 }}>
              {loading ? "Saving reflections..." : "Record Mood Log"}
            </button>
          </form>

          {/* AI Feedback Banner */}
          {recentAIResponse && (
            <div className="glass-panel" style={{ padding: "16px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", marginTop: "10px" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: "6px" }}>
                <MessageSquareHeart size={16} /> AI Support reflection
              </h4>
              <p style={{ fontSize: "0.9rem", lineHeight: "1.4", fontStyle: "italic" }}>
                "{recentAIResponse}"
              </p>
            </div>
          )}
        </div>

        {/* History Timeline */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <History size={20} /> Mood History
            </h2>
            
            {/* Admin Member Selection */}
            {isArchitect && currentWorkspace && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} color="var(--text-muted)" />
                <select
                  className="input-field"
                  value={selectedMember}
                  onChange={(e) => handleFetchMemberLogs(e.target.value)}
                  style={{ padding: "4px 8px", fontSize: "0.8rem", width: "160px" }}
                >
                  <option value="">My History</option>
                  {currentWorkspace.members
                    .filter(m => m.user._id !== undefined) // filter valid users
                    .map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
            
            {/* Normal history logs */}
            {!selectedMember && moodLogs.map((log) => {
              const emojiObj = emojis.find(e => e.value === log.score) || emojis[2];
              return (
                <div key={log._id} className="glass-panel" style={{ padding: "12px", display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.01)" }}>
                  <span style={{ fontSize: "2rem" }}>{emojiObj.char}</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <span style={{ fontWeight: "bold", color: emojiObj.color }}>{emojiObj.label}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Calendar size={10} /> {new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    {log.reason && <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{log.reason}</p>}
                    {log.aiResponse && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg-input)", padding: "6px 10px", borderRadius: "6px", borderLeft: "2px solid var(--color-primary)", marginTop: "4px" }}>
                        {log.aiResponse}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Admin inspecting another member's logs */}
            {selectedMember && !loadingMemberLogs && memberLogs.map((log) => {
              const emojiObj = emojis.find(e => e.value === log.score) || emojis[2];
              return (
                <div key={log._id} className="glass-panel" style={{ padding: "12px", display: "flex", gap: "12px", alignItems: "flex-start", background: "rgba(255,255,255,0.01)" }}>
                  <span style={{ fontSize: "2rem" }}>{emojiObj.char}</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <span style={{ fontWeight: "bold", color: emojiObj.color }}>{emojiObj.label}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Calendar size={10} /> {new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    {log.reason && <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{log.reason}</p>}
                    {log.aiResponse && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg-input)", padding: "6px 10px", borderRadius: "6px", borderLeft: "2px solid var(--color-primary)", marginTop: "4px" }}>
                        {log.aiResponse}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {selectedMember && memberLogs.length === 0 && !loadingMemberLogs && (
              <p style={{ textAlign: "center", color: "var(--text-subtle)", padding: "20px" }}>This member hasn't logged any moods yet.</p>
            )}

            {!selectedMember && moodLogs.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-subtle)", padding: "20px" }}>Log your first mood to see history!</p>
            )}

            {loadingMemberLogs && (
              <p style={{ textAlign: "center", color: "var(--text-subtle)", padding: "20px" }}>Loading logs...</p>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
