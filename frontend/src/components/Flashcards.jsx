import { useState } from "react";
import api from "../services/api";
import SubjectSelector from "./SubjectSelector";
import LoadingSpinner from "./LoadingSpinner";
import DownloadButton from "./DownloadButton";
import CopyButton from "./CopyButton";
import { useSubject } from "../context/SubjectContext";
import { Layers, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function Flashcards() {
    const { subject } = useSubject();
    const [flashcards, setFlashcards] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const generate = async () => {
        if (!subject) {
            setError("Please select a subject first.");
            return;
        }
        setLoading(true);
        setFlashcards("");
        setError("");
        try {
            const res = await api.post("/flashcards", { subject });
            setFlashcards(res.data.flashcards);
        } catch (err) {
            console.error("Flashcards generation error:", err);
            setError(err.response?.data?.detail || err.message || "Failed to generate flashcards.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "36px 40px", maxWidth: "900px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        flexShrink: 0,
                        background: "linear-gradient(135deg,#a094f8,#6d59ee)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 20px rgba(109,89,238,0.45)",
                    }}
                >
                    <Layers size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif" }}>
                        AI Flashcards
                    </h1>
                    <p style={{ fontSize: "13px", color: "rgba(180,172,230,0.5)", marginTop: "3px" }}>
                        Auto-generate study flashcards from your notes
                    </p>
                </div>
            </div>

            <SubjectSelector />
            <p style={{ fontSize: "13px", color: "rgba(180,172,230,0.45)", marginBottom: "20px" }}>
                Current subject: <span style={{ color: "#a094f8", fontWeight: 600 }}>{subject}</span>
            </p>

            <button
                onClick={generate}
                disabled={loading}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    padding: "12px 26px",
                    borderRadius: "12px",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    background: loading ? "rgba(109,89,238,0.2)" : "linear-gradient(135deg,#a094f8,#6d59ee)",
                    color: loading ? "rgba(255,255,255,0.4)" : "#fff",
                    boxShadow: loading ? "none" : "0 6px 20px rgba(109,89,238,0.4)",
                }}
            >
                <Sparkles size={16} /> {loading ? "Generating…" : "Generate Flashcards"}
            </button>

            {loading && (
                <div style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
                    <LoadingSpinner />
                </div>
            )}

            {/* Custom Error View with Retry Button */}
            {error && (
                <div
                    className="glass"
                    style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <AlertCircle size={20} style={{ color: "#f87171", flexShrink: 0, marginTop: "2px" }} />
                        <div>
                            <p style={{ fontWeight: 600, color: "#fda4a4", fontSize: "15px" }}>Flashcard Generation Failed</p>
                            <p style={{ color: "rgba(253,164,164,0.75)", fontSize: "13.5px", marginTop: "4px", lineHeight: 1.5 }}>
                                {error}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={generate}
                        style={{
                            alignSelf: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            borderRadius: "10px",
                            border: "none",
                            background: "rgba(239,68,68,0.15)",
                            color: "#fda4a4",
                            fontSize: "13.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.25)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                    >
                        <RefreshCw size={14} /> Try Again
                    </button>
                </div>
            )}

            {flashcards && (
                <>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "28px", marginBottom: "14px" }}>
                        <CopyButton content={flashcards} />
                        <DownloadButton title={`${subject} Flashcards`} content={flashcards} />
                    </div>
                    <div
                        style={{
                            borderRadius: "16px",
                            padding: "28px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(109,89,238,0.2)",
                            backdropFilter: "blur(16px)",
                            color: "rgba(220,215,250,0.9)",
                            lineHeight: 1.8,
                            fontSize: "14px",
                        }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {flashcards}
                        </ReactMarkdown>
                    </div>
                </>
            )}
        </div>
    );
}

export default Flashcards;