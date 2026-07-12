import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Search, Pencil, Trash2, MessageSquare } from "lucide-react";

function ConversationSidebar({ onSelectChat, onNewChat }) {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        try {
            const res = await api.get("/chat-history");
            setHistory(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteConversation = async (id) => {
        if (!window.confirm("Delete this conversation?")) return;
        try {
            await api.delete(`/chat-history/${id}`);
            setHistory((prev) => prev.filter((c) => c.id !== id));
            if (activeId === id) { setActiveId(null); onNewChat(); }
        } catch (err) { console.log(err); }
    };

    const renameConversation = async (chat) => {
        const newTitle = window.prompt("Rename conversation", chat.title || chat.question);
        if (!newTitle) return;
        try {
            await api.put(`/chat-history/${chat.id}`, { title: newTitle });
            setHistory((prev) => prev.map((c) => c.id === chat.id ? { ...c, title: newTitle } : c));
        } catch (err) { console.log(err); }
    };

    const filtered = history.filter((c) => {
        const t = (c.title || c.question).toLowerCase();
        return t.includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div
            style={{
                width: "240px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "rgba(14,12,40,0.75)",
                borderRight: "1px solid rgba(109,89,238,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                flexShrink: 0,
            }}
        >
            {/* New Chat button */}
            <div style={{ padding: "16px 14px 10px" }}>
                <button
                    onClick={onNewChat}
                    style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        padding: "11px", borderRadius: "12px", border: "none",
                        background: "linear-gradient(135deg,#7c6ff0,#5a48d8)",
                        color: "#fff", fontSize: "13px", fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(109,89,238,0.4)",
                        transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(109,89,238,0.6)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(109,89,238,0.4)"; }}
                >
                    <Plus size={15} /> New Chat
                </button>
            </div>

            {/* Search */}
            <div style={{ padding: "0 14px 10px" }}>
                <div
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(109,89,238,0.2)",
                        borderRadius: "10px", padding: "9px 12px",
                    }}
                >
                    <Search size={13} style={{ color: "rgba(160,150,255,0.5)", flexShrink: 0 }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search conversations"
                        style={{
                            flex: 1, background: "transparent", border: "none", outline: "none",
                            fontSize: "12px", color: "#e8e4f8",
                        }}
                    />
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px" }}>
                {loading && (
                    <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(180,172,230,0.4)", marginTop: "16px" }}>
                        Loading…
                    </p>
                )}

                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "32px" }}>
                        <MessageSquare size={24} style={{ color: "rgba(124,111,240,0.25)", margin: "0 auto 8px" }} />
                        <p style={{ fontSize: "12px", color: "rgba(180,172,230,0.35)" }}>No conversations</p>
                    </div>
                )}

                {filtered.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => { setActiveId(chat.id); onSelectChat(chat); }}
                        style={{
                            borderRadius: "10px",
                            padding: "10px 10px",
                            marginBottom: "4px",
                            cursor: "pointer",
                            background: activeId === chat.id
                                ? "linear-gradient(90deg,rgba(124,111,240,0.2),rgba(124,111,240,0.06))"
                                : "transparent",
                            borderLeft: `2px solid ${activeId === chat.id ? "#7c6ff0" : "transparent"}`,
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            if (activeId !== chat.id) e.currentTarget.style.background = "rgba(255,255,255,0.045)";
                        }}
                        onMouseLeave={(e) => {
                            if (activeId !== chat.id) e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <span
                                    style={{
                                        display: "inline-block", fontSize: "10px", fontWeight: 600,
                                        color: "rgba(160,150,255,0.7)", marginBottom: "3px",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    {chat.subject}
                                </span>
                                <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#e8e4f8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
                                    {chat.title || chat.question}
                                </p>
                            </div>

                            {/* Action buttons — show on hover via inline trick */}
                            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); renameConversation(chat); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "3px", color: "rgba(160,150,255,0.5)", borderRadius: "6px", display: "flex", alignItems: "center" }}
                                    title="Rename"
                                >
                                    <Pencil size={12} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteConversation(chat.id); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "3px", color: "rgba(251,113,133,0.5)", borderRadius: "6px", display: "flex", alignItems: "center" }}
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ConversationSidebar;