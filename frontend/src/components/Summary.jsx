import { useState } from "react";
import axios from "axios";
import SubjectSelector from "./SubjectSelector";
import LoadingSpinner from "./LoadingSpinner";
import DownloadButton from "./DownloadButton";
import CopyButton from "./CopyButton";
import { useSubject } from "../context/SubjectContext";
import { FileText, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function Summary() {
    const { subject } = useSubject();
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true); setSummary("");
        try {
            const res = await axios.post("http://127.0.0.1:8000/summary", { subject });
            setSummary(res.data.summary);
        } catch (err) {
            setSummary(err.response?.data?.error || "Something went wrong.");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding:"36px 40px", maxWidth:"900px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"32px" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"14px", flexShrink:0, background:"linear-gradient(135deg,#e879f9,#a021c3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 20px rgba(232,121,249,0.4)" }}>
                    <FileText size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize:"26px", fontWeight:700, color:"#fff", fontFamily:"'Sora',sans-serif" }}>AI Summary Generator</h1>
                    <p style={{ fontSize:"13px", color:"rgba(180,172,230,0.5)", marginTop:"3px" }}>Distill your notes into concise summaries</p>
                </div>
            </div>

            <SubjectSelector />
            <p style={{ fontSize:"13px", color:"rgba(180,172,230,0.45)", marginBottom:"20px" }}>
                Current subject: <span style={{ color:"#a094f8", fontWeight:600 }}>{subject}</span>
            </p>

            <button
                onClick={generate} disabled={loading}
                style={{ display:"flex", alignItems:"center", gap:"9px", padding:"12px 26px", borderRadius:"12px", border:"none", fontSize:"14px", fontWeight:600, cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s", background: loading ? "rgba(232,121,249,0.15)" : "linear-gradient(135deg,#e879f9,#a021c3)", color: loading ? "rgba(255,255,255,0.4)" : "#fff", boxShadow: loading ? "none" : "0 6px 20px rgba(232,121,249,0.35)" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 10px 30px rgba(232,121,249,0.5)"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 6px 20px rgba(232,121,249,0.35)"; }}
            >
                <Sparkles size={16} /> {loading ? "Generating…" : "Generate Summary"}
            </button>

            {loading && <div style={{ marginTop:"32px", display:"flex", justifyContent:"center" }}><LoadingSpinner /></div>}

            {summary && (
                <>
                    <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"28px", marginBottom:"14px" }}>
                        <CopyButton content={summary} />
                        <DownloadButton title={`${subject} Summary`} content={summary} />
                    </div>
                    <div style={{ borderRadius:"16px", padding:"28px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,121,249,0.2)", backdropFilter:"blur(16px)", color:"rgba(220,215,250,0.9)", lineHeight:1.8, fontSize:"14px" }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{summary}</ReactMarkdown>
                    </div>
                </>
            )}
        </div>
    );
}

export default Summary;