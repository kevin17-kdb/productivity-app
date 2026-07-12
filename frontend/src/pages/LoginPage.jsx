import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, BookOpen, Lightbulb, PenTool, Mail, Lock, Eye, EyeOff } from "lucide-react";

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed.");
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#0a091f" }}>

            {/* ── Left — animated study scene ── */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between"
                style={{
                    padding: "56px",
                    background: "linear-gradient(135deg, #0B0E1A 0%, #131a33 50%, #1c1440 100%)",
                }}
            >
                <div className="absolute top-1/4 left-1/3 w-[420px] h-[420px] rounded-full blur-3xl bg-accent/20 pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full blur-3xl bg-warm/10 pointer-events-none" />

                {/* Brand */}
                <div className="relative flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <span className="font-display text-lg font-semibold text-white">StudyMate AI</span>
                </div>

                {/* Floating icons */}
                <div className="relative flex-1 flex items-center justify-center gap-8">
                    <div className="relative animate-float" style={{ animationDelay: "0s" }}>
                        <div className="absolute inset-0 rounded-full blur-2xl bg-accent/40 animate-pulse-glow" />
                        <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
                            <BookOpen size={26} className="text-accent" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="relative animate-float-slow" style={{ animationDelay: "0.4s" }}>
                        <div className="absolute inset-0 rounded-full blur-3xl bg-accent/50 animate-pulse-glow" style={{ animationDelay: "0.6s" }} />
                        <div className="relative w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
                            <GraduationCap size={38} className="text-white" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="relative animate-float" style={{ animationDelay: "1.1s" }}>
                        <div className="absolute inset-0 rounded-full blur-2xl bg-warm/40 animate-pulse-glow" style={{ animationDelay: "1.2s" }} />
                        <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
                            <Lightbulb size={26} className="text-warm" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="relative animate-float-slow" style={{ animationDelay: "1.6s" }}>
                        <div className="absolute inset-0 rounded-full blur-2xl bg-accent/30 animate-pulse-glow" style={{ animationDelay: "0.3s" }} />
                        <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
                            <PenTool size={22} className="text-accent" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Bottom text */}
                <div className="relative">
                    <h2 className="font-display text-3xl font-semibold text-white leading-tight">
                        AI-Powered Learning
                    </h2>
                    <p className="text-white/60 text-base mt-2 max-w-sm">
                        Turn any note into a quiz, a flashcard set, or an answer — in seconds.
                    </p>
                </div>
            </div>

            {/* ── Right — full-height deep indigo with centred card ── */}
            <div
                className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden"
                style={{
                    padding: "40px 32px",
                    background: "linear-gradient(160deg, #0d0b1e 0%, #12103d 55%, #0d0b1e 100%)",
                }}
            >
                {/* Background glows */}
                <div
                    className="absolute rounded-full blur-[120px] pointer-events-none"
                    style={{
                        width: "480px", height: "480px",
                        top: "10%", right: "-10%",
                        background: "rgba(109,89,238,0.18)",
                    }}
                />
                <div
                    className="absolute rounded-full blur-[100px] pointer-events-none"
                    style={{
                        width: "320px", height: "320px",
                        bottom: "5%", left: "-5%",
                        background: "rgba(109,89,238,0.10)",
                    }}
                />

                {/* ── Card ── */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "520px",
                        borderRadius: "20px",
                        padding: "48px 44px",
                        background: "rgba(28,24,70,0.9)",
                        border: "1px solid rgba(109,89,238,0.28)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                        backdropFilter: "blur(24px)",
                        position: "relative",
                    }}
                >
                    {/* ── Logo ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
                        <div
                            style={{
                                width: "48px", height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, #7c6ff0 0%, #4f3fcb 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <GraduationCap size={24} color="#fff" />
                        </div>
                        <span style={{ fontSize: "18px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
                            StudyMate AI
                        </span>
                    </div>

                    {/* ── Headings ── */}
                    <p style={{ fontSize: "14px", color: "rgba(168,158,255,0.9)", marginBottom: "8px" }}>
                        Login your account
                    </p>
                    <h1
                        style={{
                            fontSize: "36px", fontWeight: 700, color: "#fff",
                            lineHeight: 1.2, marginBottom: "10px", letterSpacing: "-0.02em",
                        }}
                    >
                        Welcome back
                    </h1>
                    <p style={{ fontSize: "15px", color: "rgba(185,178,230,0.65)", marginBottom: "36px" }}>
                        Enter your email and password to continue
                    </p>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div
                                style={{
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    color: "#fca5a5",
                                    fontSize: "14px",
                                    padding: "14px 16px",
                                    borderRadius: "12px",
                                    marginBottom: "20px",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* ── Email ── */}
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                style={{
                                    display: "block", fontSize: "14px", fontWeight: 500,
                                    color: "rgba(210,205,250,0.9)", marginBottom: "10px",
                                }}
                            >
                                Email address
                            </label>
                            <div
                                style={{
                                    display: "flex", alignItems: "center", gap: "14px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(109,89,238,0.35)",
                                    borderRadius: "12px",
                                    padding: "0 18px",
                                    transition: "border-color 0.2s",
                                }}
                            >
                                <Mail size={20} color="rgba(160,150,255,0.75)" style={{ flexShrink: 0 }} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        flex: 1, background: "transparent", border: "none", outline: "none",
                                        padding: "18px 0", fontSize: "15px", color: "#fff",
                                        caretColor: "#7c6ff0",
                                    }}
                                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(124,111,240,0.75)"}
                                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(109,89,238,0.35)"}
                                />
                            </div>
                        </div>

                        {/* ── Password ── */}
                        <div style={{ marginBottom: "10px" }}>
                            <label
                                style={{
                                    display: "block", fontSize: "14px", fontWeight: 500,
                                    color: "rgba(210,205,250,0.9)", marginBottom: "10px",
                                }}
                            >
                                Password
                            </label>
                            <div
                                style={{
                                    display: "flex", alignItems: "center", gap: "14px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(109,89,238,0.35)",
                                    borderRadius: "12px",
                                    padding: "0 18px",
                                    transition: "border-color 0.2s",
                                }}
                            >
                                <Lock size={20} color="rgba(238,190,80,0.85)" style={{ flexShrink: 0 }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        flex: 1, background: "transparent", border: "none", outline: "none",
                                        padding: "18px 0", fontSize: "15px", color: "#fff",
                                        caretColor: "#7c6ff0",
                                    }}
                                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(124,111,240,0.75)"}
                                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(109,89,238,0.35)"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        padding: 0, flexShrink: 0, color: "rgba(160,150,255,0.65)",
                                        display: "flex", alignItems: "center",
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* ── Forgot password ── */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "28px" }}>
                            <Link
                                to="/forgot-password"
                                style={{ fontSize: "14px", fontWeight: 500, color: "#8b7ff5", textDecoration: "none" }}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* ── Sign in button ── */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "18px",
                                borderRadius: "12px",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                background: "linear-gradient(135deg, #7c6ff0 0%, #5a48d8 100%)",
                                color: "#fff",
                                fontSize: "16px",
                                fontWeight: 600,
                                letterSpacing: "0.01em",
                                boxShadow: "0 8px 28px rgba(109,89,238,0.45)",
                                transition: "box-shadow 0.2s, opacity 0.2s",
                                opacity: loading ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(109,89,238,0.65)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(109,89,238,0.45)"; }}
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>

                        {/* ── Sign up link ── */}
                        <p
                            style={{
                                textAlign: "center", marginTop: "28px", fontSize: "14px",
                                color: "rgba(185,178,230,0.65)",
                            }}
                        >
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/signup"
                                style={{ color: "#8b7ff5", fontWeight: 600, textDecoration: "none" }}
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;