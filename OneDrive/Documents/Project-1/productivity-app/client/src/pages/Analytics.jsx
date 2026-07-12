import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Brain, TrendingUp, BookOpen, HeartPulse, Briefcase, Sparkles, RefreshCw } from "lucide-react";

export const Analytics = () => {
  const {
    analytics,
    fetchAnalytics,
    currentWorkspace
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Studying": return <BookOpen size={16} color="var(--cat-studying)" />;
      case "Health": return <HeartPulse size={16} color="var(--cat-health)" />;
      case "Work": return <Briefcase size={16} color="var(--cat-work)" />;
      default: return <Sparkles size={16} color="var(--color-primary)" />;
    }
  };

  const getCategoryColor = (cat) => {
    const map = {
      Studying: "var(--cat-studying)",
      Health: "var(--cat-health)",
      Work: "var(--cat-work)",
      Leisure: "var(--cat-leisure)",
      General: "var(--cat-general)"
    };
    return map[cat] || "var(--cat-general)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>AI Coach Insights</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Performance breakdown and professional suggestions by Google Gemini
          </p>
        </div>
        
        <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? "animate-shake" : ""} /> {refreshing ? "Updating..." : "Recalculate AI Report"}
        </button>
      </div>

      {!analytics && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading stats and fetching coach recommendations...
        </div>
      )}

      {analytics && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "stretch" }}>
          
          {/* Completion Metrics & Categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Overview Card */}
            <div className="glass-panel" style={{ padding: "24px", display: "flex", gap: "20px", alignItems: "center", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent)" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.6rem", boxShadow: "0 0 20px var(--color-primary-glow)" }}>
                {analytics.completionRate}%
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "4px" }}>Total Completion Rate</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  You completed {analytics.completedTasks} out of {analytics.totalTasks} total tasks logged in this workspace.
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Task Category Performance</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {analytics.categoryStats && Object.entries(analytics.categoryStats).map(([cat, stat]) => (
                  <div key={cat} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                        {getCategoryIcon(cat)} {cat}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>
                        {stat.completed}/{stat.total} ({stat.rate}%)
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${stat.rate}%`, background: getCategoryColor(cat) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Coach Recommendation Report Card */}
          <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(99, 102, 241, 0.2)", background: "rgba(99, 102, 241, 0.02)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Brain size={22} /> Coach Report & Feedback
            </h2>
            
            <div style={{ 
              fontSize: "0.95rem", 
              lineHeight: "1.6", 
              color: "var(--text-main)", 
              whiteSpace: "pre-line", 
              background: "var(--bg-input)", 
              padding: "20px", 
              borderRadius: "12px", 
              borderLeft: "4px solid var(--color-primary)",
              flex: 1,
              overflowY: "auto"
            }}>
              {analytics.aiCoachReport}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
