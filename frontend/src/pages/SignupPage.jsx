import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, Sparkles, Layers, Star } from "lucide-react";

function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await signup(name, email, password);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.detail || "Signup failed.");
        }
        setLoading(false);
    };

    const features = [
        { icon: Sparkles, text: "AI-generated summaries pull the key points from every upload" },
        { icon: Layers,   text: "Flashcards build themselves from your notes, ready to review" },
        { icon: Star,     text: "Mark important questions and come back to them anytime" },
    ];

    /* shared input-wrapper style */
    const inputWrap = {
        display: "flex", alignItems: "center", gap: "14px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(109,89,238,0.35)",
        borderRadius: "12px",
        padding: "0 18px",
        transition: "border-color 0.2s",
    };
    const inputEl = {
        flex: 1, background: "transparent", border: "none", outline: "none",
        padding: "16px 0", fontSize: "15px", color: "#fff", caretColor: "#7c6ff0",
    };
    const labelStyle = {
        display: "block", fontSize: "14px", fontWeight: 500,
        color: "rgba(210,205,250,0.9)", marginBottom: "10px",
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#0a091f" }}>

            {/* ── Left — brand panel ── */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between"
                style={{ padding: "56px", background: "#100e2a", borderRight: "1px solid rgba(109,89,238,0.18)" }}
            >
                <div
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(124,111,240,0.18) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(240,168,87,0.10) 0%, transparent 70%)" }}
                />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                            <GraduationCap size={20} className="text-accent" />
                        </div>
                        <span className="font-display text-xl font-semibold text-white">StudyMate AI</span>
                    </div>
                    <h2 className="font-display text-4xl font-semibold text-white leading-tight max-w-md">
                        Everything you need to study smarter.
                    </h2>
                    <p className="text-muted text-base mt-4 max-w-sm">
                        Create an account and turn your notes into a full study toolkit in minutes.
                    </p>
                </div>

                <div className="relative space-y-6">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon size={16} className="text-accent" />
                                </div>
                                <p className="text-sm text-muted leading-relaxed">{f.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Right — deep indigo with centred card ── */}
            <div
                className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden"
                style={{
                    padding: "32px",
                    background: "linear-gradient(160deg, #0d0b1e 0%, #12103d 55%, #0d0b1e 100%)",
                }}
            >
                {/* Glow blobs */}
                <div
                    className="absolute rounded-full blur-[120px] pointer-events-none"
                    style={{ width: "480px", height: "480px", top: "10%", right: "-10%", background: "rgba(109,89,238,0.18)" }}
                />
                <div
                    className="absolute rounded-full blur-[100px] pointer-events-none"
                    style={{ width: "320px", height: "320px", bottom: "5%", left: "-5%", background: "rgba(109,89,238,0.10)" }}
                />

                {/* ── Card ── */}
                <div
                    style={{
                        width: "100%", maxWidth: "520px",
                        borderRadius: "20px", padding: "44px 44px",
                        background: "rgba(28,24,70,0.9)",
                        border: "1px solid rgba(109,89,238,0.28)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                        backdropFilter: "blur(24px)",
                        position: "relative",
                    }}
                >
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                        <div
                            style={{
                                width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
                                background: "linear-gradient(135deg, #7c6ff0 0%, #4f3fcb 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <GraduationCap size={24} color="#fff" />
                        </div>
                        <span style={{ fontSize: "18px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
                            StudyMate AI
                        </span>
                    </div>

                    {/* Headings */}
                    <p style={{ fontSize: "14px", color: "rgba(168,158,255,0.9)", marginBottom: "8px" }}>
                        Create your account
                    </p>
                    <h1 style={{ fontSize: "34px", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                        Get started
                    </h1>
                    <p style={{ fontSize: "15px", color: "rgba(185,178,230,0.65)", marginBottom: "28px" }}>
                        Start studying smarter with StudyMate AI
                    </p>

                    <form onSubmit={handleSignup}>
                        {error && (
                            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "14px", padding: "14px 16px", borderRadius: "12px", marginBottom: "18px" }}>
                                {error}
                            </div>
                        )}

                        {/* Full name */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>Full name</label>
                            <div style={inputWrap}>
                                <User size={20} color="rgba(160,150,255,0.75)" style={{ flexShrink: 0 }} />
                                <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required style={inputEl}
                                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(124,111,240,0.75)"}
                                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(109,89,238,0.35)"} />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>Email address</label>
                            <div style={inputWrap}>
                                <Mail size={20} color="rgba(160,150,255,0.75)" style={{ flexShrink: 0 }} />
                                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputEl}
                                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(124,111,240,0.75)"}
                                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(109,89,238,0.35)"} />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>Password</label>
                            <div style={inputWrap}>
                                <Lock size={20} color="rgba(238,190,80,0.85)" style={{ flexShrink: 0 }} />
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputEl}
                                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(124,111,240,0.75)"}
                                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(109,89,238,0.35)"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, color: "rgba(160,150,255,0.65)", display: "flex", alignItems: "center" }}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: "28px" }}>
                            <label style={labelStyle}>Confirm password</label>
                            <div style={inputWrap}>
                                <Lock size={20} color="rgba(238,190,80,0.85)" style={{ flexShrink: 0 }} />
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputEl}
                                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(124,111,240,0.75)"}
                                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "rgba(109,89,238,0.35)"} />
                            </div>
                        </div>

                        {/* Create account button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "18px", borderRadius: "12px", border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                background: "linear-gradient(135deg, #7c6ff0 0%, #5a48d8 100%)",
                                color: "#fff", fontSize: "16px", fontWeight: 600, letterSpacing: "0.01em",
                                boxShadow: "0 8px 28px rgba(109,89,238,0.45)",
                                transition: "box-shadow 0.2s, opacity 0.2s",
                                opacity: loading ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(109,89,238,0.65)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(109,89,238,0.45)"; }}
                        >
                            {loading ? "Creating account…" : "Create account"}
                        </button>

                        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "rgba(185,178,230,0.65)" }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "#8b7ff5", fontWeight: 600, textDecoration: "none" }}>
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;