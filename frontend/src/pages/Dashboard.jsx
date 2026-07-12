import { useEffect, useState } from "react";
import api from "../services/api";
import BarChart from "../components/charts/BarChart";
import PieChart from "../components/charts/PieChart";
import { Upload, MessageSquare, ClipboardList, Layers, FileText, Star, TrendingUp } from "lucide-react";

/* ── Stat card colour config ── */
const statConfig = [
    { key: "uploads",            label: "Uploads",    icon: Upload,        color: "#7c6ff0", glow: "rgba(124,111,240,0.35)" },
    { key: "questions",          label: "Questions",  icon: MessageSquare, color: "#f0a857", glow: "rgba(240,168,87,0.35)"  },
    { key: "quizzes",            label: "Quizzes",    icon: ClipboardList, color: "#34d399", glow: "rgba(52,211,153,0.35)"  },
    { key: "flashcards",         label: "Flashcards", icon: Layers,        color: "#38bdf8", glow: "rgba(56,189,248,0.35)"  },
    { key: "summaries",          label: "Summaries",  icon: FileText,      color: "#e879f9", glow: "rgba(232,121,249,0.35)" },
    { key: "important_questions",label: "Important",  icon: Star,          color: "#fb7185", glow: "rgba(251,113,133,0.35)" },
];

function StatCard({ label, value, icon: Icon, color, glow }) {
    return (
        <div
            style={{
                position: "relative",
                borderRadius: "16px",
                padding: "24px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(109,89,238,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 16px 40px ${glow}`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {/* Accent blob */}
            <div
                style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "90px", height: "90px", borderRadius: "50%",
                    background: color, opacity: 0.12, filter: "blur(24px)",
                    pointerEvents: "none",
                }}
            />
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(180,172,230,0.65)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {label}
                </p>
                <div
                    style={{
                        width: "34px", height: "34px", borderRadius: "10px",
                        background: `${color}22`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <Icon size={16} style={{ color }} />
                </div>
            </div>
            {/* Value */}
            <p style={{ fontSize: "38px", fontWeight: 700, color: "#fff", lineHeight: 1, fontFamily: "'Sora',sans-serif" }}>
                {value}
            </p>
        </div>
    );
}

function ListCard({ title, icon: Icon, children }) {
    return (
        <div
            style={{
                borderRadius: "16px",
                padding: "24px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(109,89,238,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                {Icon && <Icon size={16} style={{ color: "#7c6ff0" }} />}
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif" }}>{title}</h2>
            </div>
            {children}
        </div>
    );
}

function Dashboard() {
    const [user, setUser] = useState({ name: "" });
    const [stats, setStats] = useState({ uploads:0, questions:0, quizzes:0, flashcards:0, summaries:0, important_questions:0 });
    const [documents, setDocuments] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            const [me, dashboard, docs, chats] = await Promise.all([
                api.get("/me"),
                api.get("/dashboard"),
                api.get("/recent-documents"),
                api.get("/recent-questions"),
            ]);
            setUser(me.data);
            setStats(dashboard.data);
            setDocuments(docs.data);
            setQuestions(chats.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:"16px" }}>
                <div style={{ width:"40px", height:"40px", border:"3px solid rgba(124,111,240,0.2)", borderTopColor:"#7c6ff0", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                <p style={{ color:"rgba(180,172,230,0.6)", fontSize:"14px" }}>Loading dashboard…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: "36px 40px", minHeight: "100vh" }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: "36px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif", lineHeight: 1.2 }}>
                    Welcome back, <span style={{ color: "#a094f8" }}>{user.name}</span> 👋
                </h1>
                <p style={{ color: "rgba(180,172,230,0.55)", marginTop: "8px", fontSize: "14px" }}>
                    Here&apos;s your StudyMate AI overview.
                </p>
            </div>

            {error && (
                <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", padding:"14px 18px", borderRadius:"12px", marginBottom:"24px", fontSize:"14px" }}>
                    {error}
                </div>
            )}

            {/* ── Stat grid ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"16px", marginBottom:"28px" }}>
                {statConfig.map((c) => (
                    <StatCard key={c.key} label={c.label} value={stats[c.key]} icon={c.icon} color={c.color} glow={c.glow} />
                ))}
            </div>

            {/* ── Lists row ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"28px" }}>
                <ListCard title="Recent Uploads">
                    {documents.length === 0 ? (
                        <p style={{ color:"rgba(180,172,230,0.4)", fontSize:"13px" }}>No uploads yet.</p>
                    ) : documents.map((doc, i) => (
                        <div key={i} style={{ padding:"12px 0", borderBottom: i < documents.length-1 ? "1px solid rgba(109,89,238,0.12)" : "none" }}>
                            <p style={{ fontSize:"13.5px", fontWeight:600, color:"#e8e4f8" }}>{doc.filename}</p>
                            <p style={{ fontSize:"12px", color:"rgba(160,150,255,0.7)", marginTop:"3px" }}>{doc.subject}</p>
                        </div>
                    ))}
                </ListCard>

                <ListCard title="Recent Questions">
                    {questions.length === 0 ? (
                        <p style={{ color:"rgba(180,172,230,0.4)", fontSize:"13px" }}>No questions yet.</p>
                    ) : questions.map((chat, i) => (
                        <div key={i} style={{ padding:"12px 0", borderBottom: i < questions.length-1 ? "1px solid rgba(109,89,238,0.12)" : "none" }}>
                            <p style={{ fontSize:"13.5px", fontWeight:600, color:"#e8e4f8" }}>{chat.question}</p>
                            <p style={{ fontSize:"12px", color:"rgba(160,150,255,0.7)", marginTop:"3px" }}>{chat.subject}</p>
                        </div>
                    ))}
                </ListCard>
            </div>

            {/* ── Charts row ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                <ListCard title="Study Activity" icon={TrendingUp}>
                    <BarChart stats={stats} />
                </ListCard>
                <ListCard title="AI Usage">
                    <PieChart stats={stats} />
                </ListCard>
            </div>
        </div>
    );
}

export default Dashboard;