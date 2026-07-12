import React, { useState } from "react";
import { Palette } from "lucide-react";

const themes = [
  { id: "aurora", name: "Aurora", colors: ["#0a1628", "#1a2744", "#00d4aa", "#7c3aed"] },
  { id: "midnight", name: "Midnight", colors: ["#0f0f11", "#1a1a22", "#6366f1", "#818cf8"] },
  { id: "polar", name: "Polar", colors: ["#f5f6fa", "#ffffff", "#3b82f6", "#6366f1"] },
  { id: "sunset", name: "Sunset", colors: ["#1a0f0a", "#2a1810", "#f59e0b", "#ef4444"] },
  { id: "ocean", name: "Ocean", colors: ["#0a192f", "#112240", "#06b6d4", "#0ea5e9"] },
  { id: "forest", name: "Forest", colors: ["#0a1a0f", "#132a1a", "#10b981", "#059669"] },
  { id: "lavender", name: "Lavender", colors: ["#1a0f2e", "#2a1a44", "#a78bfa", "#8b5cf6"] },
  { id: "monochrome", name: "Mono", colors: ["#111111", "#222222", "#ffffff", "#888888"] },
];

export const ThemePicker = ({ currentTheme, onThemeChange }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <button
        className="btn"
        onClick={() => setExpanded(!expanded)}
        style={{
          justifyContent: "flex-start",
          fontSize: "0.9rem",
          color: "var(--text-main)",
        }}
      >
        <Palette size={18} /> Theme
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
          {currentTheme}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "6px",
            padding: "4px",
          }}
        >
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { onThemeChange(t.id); setExpanded(false); }}
              title={t.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "6px 2px",
                borderRadius: "6px",
                border: currentTheme === t.id ? "2px solid var(--color-primary)" : "2px solid transparent",
                background: currentTheme === t.id ? "var(--bg-active)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", width: "22px", height: "22px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                {t.colors.map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>
              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
