import { useState, useEffect } from "react";
import api from "../services/api";
import { useSubject } from "../context/SubjectContext";
import { BookOpen, ChevronDown, RefreshCw } from "lucide-react";

function SubjectSelector() {
    const { subject, setSubject } = useSubject();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await api.get("/subjects");
            setSubjects(res.data);
            // If current subject is not in list and list has subjects, default to first subject
            if (res.data.length > 0 && (!subject || !res.data.includes(subject))) {
                setSubject(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch subjects:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Listen for custom event when new notes are uploaded to refresh the list
    useEffect(() => {
        const handleRefresh = () => fetchSubjects();
        window.addEventListener("refresh-subjects", handleRefresh);
        return () => window.removeEventListener("refresh-subjects", handleRefresh);
    }, [subject]);

    return (
        <div style={{ marginBottom: "24px" }}>
            <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", fontWeight:600, color:"rgba(180,172,230,0.75)", marginBottom:"10px", textTransform:"uppercase", letterSpacing:"0.05em" }}>
                <BookOpen size={14} style={{ color:"#7c6ff0" }} />
                Current Subject
                {loading && <RefreshCw size={12} className="animate-spin" style={{ color: "#7c6ff0" }} />}
            </label>

            <div style={{ position:"relative", width:"100%", maxWidth:"380px" }}>
                {subjects.length === 0 ? (
                    <div
                        style={{
                            width:"100%",
                            background:"rgba(255,255,255,0.02)",
                            border:"1px dashed rgba(109,89,238,0.2)",
                            borderRadius:"12px",
                            padding:"12px 16px",
                            color:"rgba(180,172,230,0.5)",
                            fontSize:"14px",
                        }}
                    >
                        No subjects yet. Upload PDF first.
                    </div>
                ) : (
                    <>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            style={{
                                width:"100%",
                                appearance:"none", WebkitAppearance:"none",
                                background:"rgba(15,14,35,0.6)",
                                border:"1px solid rgba(109,89,238,0.3)",
                                borderRadius:"12px",
                                padding:"12px 42px 12px 16px",
                                color:"#e8e4f8",
                                fontSize:"14px",
                                fontWeight:500,
                                cursor:"pointer",
                                outline:"none",
                                transition:"border-color 0.2s",
                                backdropFilter:"blur(12px)",
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(124,111,240,0.7)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(109,89,238,0.3)"; }}
                        >
                            {subjects.map((sub) => (
                                <option key={sub} value={sub} style={{ background: "#100f24", color: "#e8e4f8" }}>{sub}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            style={{
                                position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)",
                                color:"rgba(160,150,255,0.6)", pointerEvents:"none",
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default SubjectSelector;