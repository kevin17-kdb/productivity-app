import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import SubjectSelector from "./SubjectSelector";
import MessageBubble from "./MessageBubble";
import { exportChatPDF } from "../utils/exportChat";
import { Send, FileDown, Bot, Sparkles } from "lucide-react";
import { useSubject } from "../context/SubjectContext";

function Chat({ previousChat }) {
    const { subject } = useSubject();
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!previousChat) { setMessages([]); return; }
        setMessages([
            { sender: "user", text: previousChat.question },
            { sender: "ai",   text: previousChat.answer, question: previousChat.question },
        ]);
    }, [previousChat]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const askQuestion = async () => {
        if (!question.trim()) return;
        const q = question;
        setMessages((p) => [...p, { sender: "user", text: q }]);
        setQuestion("");
        setLoading(true);
        try {
            const res = await api.post("/chat", { subject, question: q });
            setMessages((p) => [...p, { sender: "ai", text: res.data.answer, question: q }]);
        } catch (err) {
            setMessages((p) => [...p, { sender: "ai", text: err.response?.data?.detail || "Something went wrong.", question: q }]);
        } finally {
            setLoading(false);
        }
    };

    const regenerateAnswer = async (originalQuestion, index) => {
        if (!originalQuestion) return;
        setLoading(true);
        try {
            const res = await api.post("/chat", { subject, question: originalQuestion });
            setMessages((p) => { const u = [...p]; u[index] = { ...u[index], text: res.data.answer }; return u; });
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const isEmpty = messages.length === 0 && !loading;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "transparent",
            }}
        >
            {/* ── Top bar ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 28px",
                    borderBottom: "1px solid rgba(109,89,238,0.15)",
                    background: "rgba(14,12,40,0.6)",
                    backdropFilter: "blur(16px)",
                    flexShrink: 0,
                }}
            >
                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                            background: "linear-gradient(135deg,#7c6ff0,#4f3fcb)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(109,89,238,0.4)",
                        }}
                    >
                        <Bot size={18} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif", lineHeight: 1.2 }}>AI Study Assistant</p>
                        <p style={{ fontSize: "11px", color: "rgba(180,172,230,0.5)" }}>Powered by your notes</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Subject selector inline */}
                    <div style={{ minWidth: "180px" }}>
                        <SubjectSelector />
                    </div>

                    {/* Export button */}
                    <button
                        onClick={() => exportChatPDF(messages)}
                        disabled={messages.length === 0}
                        style={{
                            display: "flex", alignItems: "center", gap: "7px",
                            padding: "9px 16px", borderRadius: "10px", border: "none",
                            background: messages.length === 0 ? "rgba(255,255,255,0.05)" : "rgba(52,211,153,0.12)",
                            color: messages.length === 0 ? "rgba(180,172,230,0.3)" : "#6ee7b7",
                            fontSize: "12px", fontWeight: 600,
                            cursor: messages.length === 0 ? "not-allowed" : "pointer",
                            border: "1px solid " + (messages.length === 0 ? "rgba(109,89,238,0.12)" : "rgba(52,211,153,0.25)"),
                            transition: "all 0.2s", flexShrink: 0,
                        }}
                    >
                        <FileDown size={14} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* ── Messages area ── */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "24px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                }}
            >
                {/* Empty state */}
                {isEmpty && (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            padding: "60px 24px",
                        }}
                    >
                        <div
                            style={{
                                width: "72px", height: "72px", borderRadius: "20px",
                                background: "linear-gradient(135deg,rgba(124,111,240,0.2),rgba(79,63,203,0.1))",
                                border: "1px solid rgba(124,111,240,0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <Sparkles size={30} style={{ color: "#7c6ff0" }} />
                        </div>
                        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif", marginBottom: "10px" }}>
                            Welcome to StudyMate AI 👋
                        </h2>
                        <p style={{ fontSize: "14px", color: "rgba(180,172,230,0.5)", maxWidth: "320px", lineHeight: 1.6 }}>
                            Upload your notes and ask me anything — I'll answer based on your study material.
                        </p>
                    </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={index}
                        message={msg}
                        onRegenerate={
                            msg.sender === "ai"
                                ? () => regenerateAnswer(msg.question, index)
                                : undefined
                        }
                    />
                ))}

                {/* Thinking indicator */}
                {loading && (
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div
                            style={{
                                width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                                background: "linear-gradient(135deg,#7c6ff0,#4f3fcb)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <Bot size={16} color="#fff" />
                        </div>
                        <div
                            style={{
                                padding: "14px 18px",
                                borderRadius: "14px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(109,89,238,0.2)",
                                backdropFilter: "blur(12px)",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}
                        >
                            <div style={{ display: "flex", gap: "5px" }}>
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: "7px", height: "7px", borderRadius: "50%",
                                            background: "#7c6ff0",
                                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                            <span style={{ fontSize: "13px", color: "rgba(180,172,230,0.7)" }}>StudyMate AI is thinking…</span>
                            <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div
                style={{
                    padding: "16px 28px 20px",
                    borderTop: "1px solid rgba(109,89,238,0.12)",
                    background: "rgba(14,12,40,0.55)",
                    backdropFilter: "blur(16px)",
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(109,89,238,0.28)",
                        borderRadius: "16px",
                        padding: "12px 12px 12px 18px",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(124,111,240,0.6)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(109,89,238,0.28)"; }}
                >
                    <textarea
                        rows={1}
                        value={question}
                        onChange={(e) => { setQuestion(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askQuestion(); } }}
                        placeholder="Message StudyMate AI…"
                        style={{
                            flex: 1, background: "transparent", border: "none", outline: "none",
                            resize: "none", fontSize: "14px", color: "#e8e4f8",
                            lineHeight: 1.6, maxHeight: "120px", overflowY: "auto",
                            caretColor: "#7c6ff0",
                        }}
                    />

                    <button
                        onClick={askQuestion}
                        disabled={loading || !question.trim()}
                        style={{
                            width: "38px", height: "38px", borderRadius: "10px", border: "none",
                            flexShrink: 0,
                            background: (loading || !question.trim())
                                ? "rgba(109,89,238,0.18)"
                                : "linear-gradient(135deg,#7c6ff0,#5a48d8)",
                            color: (loading || !question.trim()) ? "rgba(255,255,255,0.3)" : "#fff",
                            cursor: (loading || !question.trim()) ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: (!loading && question.trim()) ? "0 4px 14px rgba(109,89,238,0.4)" : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(180,172,230,0.3)", marginTop: "8px", textAlign: "center" }}>
                    Press Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

export default Chat;