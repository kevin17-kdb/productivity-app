import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard, Upload, MessageSquare, History,
    ClipboardList, Layers, FileText, Star, LogOut, GraduationCap
} from "lucide-react";

const links = [
    { name: "Dashboard",          path: "/",          icon: LayoutDashboard },
    { name: "Upload",             path: "/upload",     icon: Upload },
    { name: "AI Chat",            path: "/chat",       icon: MessageSquare },
    { name: "Chat History",       path: "/history",    icon: History },
    { name: "Quiz",               path: "/quiz",       icon: ClipboardList },
    { name: "Flashcards",         path: "/flashcards", icon: Layers },
    { name: "Summary",            path: "/summary",    icon: FileText },
    { name: "Important Questions",path: "/important",  icon: Star },
];

function Sidebar() {
    const location = useLocation();
    const navigate  = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <aside
            style={{
                width: "240px",
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexShrink: 0,
                overflowY: "auto",
                background: "rgba(14,12,40,0.82)",
                borderRight: "1px solid rgba(109,89,238,0.18)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
            }}
        >
            {/* ── Top section ── */}
            <div>
                {/* Brand */}
                <div
                    style={{
                        padding: "24px 20px 20px",
                        borderBottom: "1px solid rgba(109,89,238,0.12)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <div
                        style={{
                            width: "38px", height: "38px",
                            borderRadius: "12px", flexShrink: 0,
                            background: "linear-gradient(135deg,#7c6ff0,#4f3fcb)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 16px rgba(109,89,238,0.45)",
                        }}
                    >
                        <GraduationCap size={19} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: 1.2, fontFamily:"'Sora',sans-serif" }}>
                            StudyMate AI
                        </p>
                        <p style={{ fontSize: "11px", color: "rgba(180,172,230,0.55)", marginTop: "2px" }}>Learn smarter</p>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: "14px 10px" }}>
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "11px",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    marginBottom: "2px",
                                    fontSize: "13.5px",
                                    fontWeight: active ? 600 : 500,
                                    textDecoration: "none",
                                    color: active ? "#fff" : "rgba(180,172,230,0.65)",
                                    background: active
                                        ? "linear-gradient(90deg,rgba(124,111,240,0.2),rgba(124,111,240,0.05))"
                                        : "transparent",
                                    borderLeft: active ? "2px solid #7c6ff0" : "2px solid transparent",
                                    transition: "all 0.18s ease",
                                    position: "relative",
                                }}
                            >
                                <Icon
                                    size={16}
                                    style={{ color: active ? "#a094f8" : "rgba(160,152,220,0.55)", flexShrink: 0 }}
                                />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* ── User section ── */}
            <div
                style={{
                    padding: "16px",
                    borderTop: "1px solid rgba(109,89,238,0.12)",
                }}
            >
                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 4px", marginBottom: "10px" }}>
                    <div
                        style={{
                            width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg,#7c6ff0,#4f3fcb)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "14px", fontWeight: 700, color: "#fff",
                            boxShadow: "0 2px 10px rgba(109,89,238,0.4)",
                        }}
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user?.name || "Guest"}
                        </p>
                        <p style={{ fontSize: "11px", color: "rgba(180,172,230,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user?.email || "No email"}
                        </p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        padding: "9px",
                        borderRadius: "10px",
                        border: "1px solid rgba(109,89,238,0.2)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(180,172,230,0.65)",
                        fontSize: "13px", fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                        e.currentTarget.style.color = "#f87171";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "rgba(109,89,238,0.2)";
                        e.currentTarget.style.color = "rgba(180,172,230,0.65)";
                    }}
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;