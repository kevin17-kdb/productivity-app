import { useEffect, useState } from "react";
import api from "../services/api";
import { History, MessageSquare, Bot, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function ChatHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:"12px" }}>
                <div style={{ width:"36px", height:"36px", border:"3px solid rgba(124,111,240,0.2)", borderTopColor:"#7c6ff0", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                <p style={{ color:"rgba(180,172,230,0.55)", fontSize:"14px" }}>Loading history…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding:"36px 40px", maxWidth:"880px" }}>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"32px" }}>
                <div
                    style={{
                        width:"48px", height:"48px", borderRadius:"14px", flexShrink:0,
                        background:"linear-gradient(135deg,#7c6ff0,#4f3fcb)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 6px 20px rgba(109,89,238,0.45)",
                    }}
                >
                    <History size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize:"26px", fontWeight:700, color:"#fff", fontFamily:"'Sora',sans-serif" }}>Chat History</h1>
                    <p style={{ fontSize:"13px", color:"rgba(180,172,230,0.5)", marginTop:"3px" }}>{history.length} conversation{history.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {/* Empty state */}
            {history.length === 0 && (
                <div
                    style={{
                        textAlign:"center", padding:"80px 32px",
                        borderRadius:"20px",
                        background:"rgba(255,255,255,0.03)",
                        border:"1px solid rgba(109,89,238,0.15)",
                    }}
                >
                    <MessageSquare size={40} style={{ color:"rgba(124,111,240,0.4)", margin:"0 auto 16px" }} />
                    <p style={{ fontSize:"16px", fontWeight:600, color:"rgba(200,195,250,0.6)" }}>No conversations yet</p>
                    <p style={{ fontSize:"13px", color:"rgba(180,172,230,0.35)", marginTop:"6px" }}>Start chatting to see your history here</p>
                </div>
            )}

            {/* History list */}
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                {history.map((chat) => (
                    <div
                        key={chat.id}
                        style={{
                            borderRadius:"16px",
                            background:"rgba(255,255,255,0.04)",
                            border:"1px solid rgba(109,89,238,0.18)",
                            backdropFilter:"blur(20px)",
                            WebkitBackdropFilter:"blur(20px)",
                            padding:"24px",
                            transition:"transform 0.18s, box-shadow 0.18s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(109,89,238,0.18)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                    >
                        {/* Card header */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"18px" }}>
                            <div>
                                <h2 style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"5px" }}>
                                    {chat.title || chat.question}
                                </h2>
                                <span
                                    style={{
                                        display:"inline-block",
                                        padding:"3px 10px", borderRadius:"20px",
                                        background:"rgba(124,111,240,0.15)",
                                        border:"1px solid rgba(124,111,240,0.25)",
                                        fontSize:"11px", fontWeight:600,
                                        color:"#a094f8", letterSpacing:"0.04em",
                                    }}
                                >
                                    {chat.subject}
                                </span>
                            </div>
                            {chat.created_at && (
                                <div style={{ display:"flex", alignItems:"center", gap:"6px", color:"rgba(180,172,230,0.4)", fontSize:"12px", flexShrink:0, marginLeft:"16px" }}>
                                    <Clock size={13} />
                                    {new Date(chat.created_at).toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* Question */}
                        <div style={{ marginBottom:"16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                                <MessageSquare size={14} style={{ color:"#f0a857" }} />
                                <p style={{ fontSize:"12px", fontWeight:700, color:"rgba(240,168,87,0.9)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Question</p>
                            </div>
                            <p style={{ fontSize:"14px", color:"rgba(220,215,250,0.85)", lineHeight:1.6, paddingLeft:"22px" }}>
                                {chat.question}
                            </p>
                        </div>

                        {/* Answer */}
                        <div
                            style={{
                                background:"rgba(255,255,255,0.03)",
                                border:"1px solid rgba(109,89,238,0.12)",
                                borderRadius:"12px", padding:"16px",
                            }}
                        >
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                                <Bot size={14} style={{ color:"#7c6ff0" }} />
                                <p style={{ fontSize:"12px", fontWeight:700, color:"rgba(124,111,240,0.9)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Answer</p>
                            </div>
                            <div style={{ fontSize:"14.5px", color:"rgba(200,195,240,0.8)", lineHeight:1.8, paddingLeft:"22px", fontFamily:"'Inter',sans-serif" }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {chat.answer}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatHistoryPage;