import React, { useState, useEffect } from "react";
import { useApp } from "./context/AppContext";
import { Sidebar } from "./components/Sidebar";
import { ReminderPopup } from "./components/ReminderPopup";
import { Dashboard } from "./pages/Dashboard";
import { MoodDiary } from "./pages/MoodDiary";
import { Analytics } from "./pages/Analytics";
import { WorkLog } from "./pages/WorkLog";
import { Tracker } from "./pages/Tracker";
import { Notes } from "./pages/Notes";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Sparkles, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import axios from "axios";

function App() {
  const { token, loading, tasks, currentWorkspace } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, mood, analytics
  const [authView, setAuthView] = useState("login"); // login, register

  // Celebration state
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCelebratedWorkspace, setLastCelebratedWorkspace] = useState("");
  const [lastCelebratedCount, setLastCelebratedCount] = useState(0);

  // Monitor task completion for 100% celebrations
  useEffect(() => {
    if (!token || !currentWorkspace || tasks.length === 0) return;

    // Filter tasks for active view (e.g. daily, weekly, or monthly)
    const activeTasks = tasks.filter(t => t.completed);
    
    // We only celebrate if:
    // 1. Total tasks > 0
    // 2. All tasks are completed (completed tasks === total tasks)
    // 3. We haven't already celebrated this count of completed tasks in this workspace
    if (tasks.length > 0 && tasks.every(t => t.completed)) {
      const workspaceKey = `${currentWorkspace._id}_${tasks.length}`;
      if (lastCelebratedWorkspace !== workspaceKey) {
        setLastCelebratedWorkspace(workspaceKey);
        triggerCelebration();
      }
    }
  }, [tasks, currentWorkspace, token]);

  const triggerCelebration = async () => {
    // 1. Throw Confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // 2. Call Gemini for custom congrats message
    try {
      const taskIds = tasks.map(t => t._id);
      const res = await axios.post("/api/ai/celebrate", { taskIds });
      setCelebrationMessage(res.data.message);
      setShowCelebration(true);
    } catch (e) {
      setCelebrationMessage("Incredible effort! You completed 100% of your checklist. Keep up the high energy! 🎉");
      setShowCelebration(true);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-app)" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid var(--border-glass)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "shake 1s linear infinite" }}></div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Initializing Viora...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!token) {
    return authView === "login" ? (
      <Login onNavigateToRegister={() => setAuthView("register")} />
    ) : (
      <Register onNavigateToLogin={() => setAuthView("login")} />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Viewport */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
        <main className="main-content" style={{ flex: 1 }}>
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "worklog" && <WorkLog />}
          {activeTab === "tracker" && <Tracker />}
          {activeTab === "notes" && <Notes />}
          {activeTab === "mood" && <MoodDiary />}
          {activeTab === "analytics" && <Analytics />}
        </main>
      </div>

      {/* Reminder System */}
      <ReminderPopup />

      {/* celebration modal */}
      {showCelebration && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "420px", padding: "40px", textAlign: "center", background: "var(--bg-app)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", boxShadow: "0 0 30px rgba(245,158,11,0.2)" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Trophy size={36} />
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>100% Completed!</h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.5", fontStyle: "italic", background: "var(--bg-input)", padding: "16px", borderRadius: "10px" }}>
              "{celebrationMessage}"
            </p>
            <button className="btn btn-primary" onClick={() => setShowCelebration(false)} style={{ width: "100%", padding: "12px", background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}>
              <Sparkles size={16} /> Continue Awesomeness
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
