import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BrainCircuit, Mail, Lock, User } from "lucide-react";

export const Register = ({ onNavigateToLogin }) => {
  const { signup, login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signup(name, email, password);
      setSuccess("Account created successfully! Logging you in...");
      // Auto login
      setTimeout(async () => {
        try {
          await login(email, password);
        } catch (err) {
          onNavigateToLogin();
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flex: 1, minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 60%)" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <BrainCircuit size={48} color="var(--color-primary)" className="animate-glow" style={{ borderRadius: "50%" }} />
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Get started with your collaborative tracker</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center" }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="input-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--text-subtle)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                required 
                className="input-field" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--text-subtle)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="email" 
                required 
                className="input-field" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-subtle)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="password" 
                required 
                className="input-field" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "12px", width: "100%", fontSize: "1rem", marginTop: "10px" }}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer Link */}
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <span onClick={onNavigateToLogin} style={{ color: "var(--color-primary)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            Log In
          </span>
        </p>

      </div>
    </div>
  );
};
