import { useState } from "react";
import api from "../services/api";
import { UploadCloud, CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";

function Upload() {
    const [file, setFile] = useState(null);
    const [subjectInput, setSubjectInput] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" | "error"
    const [uploading, setUploading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Call detect-subject endpoint to read PDF text & return detected subject
    const detectSubject = async (selectedFile) => {
        setDetecting(true);
        setMessage("");
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await api.post("/detect-subject", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data?.subject) {
                setSubjectInput(res.data.subject);
                setMessage(`AI detected subject as "${res.data.subject}". Feel free to edit below.`);
                setMessageType("success");
            }
        } catch (err) {
            console.error("Subject detection failed:", err);
            setMessage("Could not automatically detect subject. Please enter it manually below.");
            setMessageType("error");
        } finally {
            setDetecting(false);
        }
    };

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        detectSubject(selectedFile);
    };

    const uploadPDF = async () => {
        if (!subjectInput.trim()) {
            setMessage("Please enter a subject.");
            setMessageType("error");
            return;
        }
        if (!file) {
            setMessage("Please select a PDF file.");
            setMessageType("error");
            return;
        }

        const formData = new FormData();
        formData.append("subject", subjectInput.trim());
        formData.append("file", file);

        setUploading(true);
        setMessage("");
        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessage(`Uploaded successfully to subject "${subjectInput.trim()}"!`);
            setMessageType("success");
            setFile(null);
            setSubjectInput("");
            // Dispatch dynamic subject refresh event
            window.dispatchEvent(new Event("refresh-subjects"));
        } catch (err) {
            setMessage(err.response?.data?.detail || "Upload failed.");
            setMessageType("error");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped?.type === "application/pdf") {
            handleFileChange(dropped);
        }
    };

    return (
        <div style={{ padding: "36px 40px", maxWidth: "760px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        flexShrink: 0,
                        background: "linear-gradient(135deg,#7c6ff0,#4f3fcb)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 20px rgba(109,89,238,0.45)",
                    }}
                >
                    <UploadCloud size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif" }}>
                        Upload Notes
                    </h1>
                    <p style={{ fontSize: "13px", color: "rgba(180,172,230,0.5)", marginTop: "3px" }}>
                        Upload any PDF. The AI will auto-detect the subject and extract notes.
                    </p>
                </div>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                    borderRadius: "16px",
                    border: `2px dashed ${dragOver ? "rgba(124,111,240,0.8)" : "rgba(109,89,238,0.3)"}`,
                    background: dragOver ? "rgba(109,89,238,0.08)" : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(16px)",
                    padding: "48px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                }}
                onClick={() => document.getElementById("pdf-input").click()}
            >
                <div
                    style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        background: "rgba(124,111,240,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "4px",
                    }}
                >
                    {detecting ? (
                        <Loader2 size={24} className="animate-spin" style={{ color: "#7c6ff0" }} />
                    ) : file ? (
                        <FileText size={24} style={{ color: "#7c6ff0" }} />
                    ) : (
                        <UploadCloud size={24} style={{ color: "rgba(160,150,255,0.6)" }} />
                    )}
                </div>

                {detecting ? (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#a094f8" }}>Reading PDF...</p>
                        <p style={{ fontSize: "12px", color: "rgba(180,172,230,0.45)", marginTop: "4px" }}>
                            Detecting academic subject dynamically
                        </p>
                    </div>
                ) : file ? (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#a094f8" }}>{file.name}</p>
                        <p style={{ fontSize: "12px", color: "rgba(180,172,230,0.45)", marginTop: "4px" }}>
                            {(file.size / 1024).toFixed(1)} KB · Click to change
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "rgba(210,205,250,0.85)" }}>
                            Drag & drop a PDF here
                        </p>
                        <p style={{ fontSize: "13px", color: "rgba(180,172,230,0.45)", marginTop: "4px" }}>
                            or click to browse
                        </p>
                    </div>
                )}

                <input
                    id="pdf-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e.target.files[0])}
                />
            </div>

            {/* Custom Subject Input */}
            <div style={{ marginTop: "24px" }}>
                <label
                    style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "rgba(180,172,230,0.75)",
                        marginBottom: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    Subject Name
                </label>
                <input
                    type="text"
                    placeholder="e.g. Signal Processing, Organic Chemistry"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    style={{
                        width: "100%",
                        maxWidth: "480px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(109,89,238,0.3)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        color: "#e8e4f8",
                        fontSize: "14px",
                        fontWeight: 500,
                        outline: "none",
                        transition: "border-color 0.2s",
                        backdropFilter: "blur(12px)",
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(124,111,240,0.7)";
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(109,89,238,0.3)";
                    }}
                />
            </div>

            {/* Upload button */}
            <button
                onClick={uploadPDF}
                disabled={uploading || detecting || !file}
                style={{
                    marginTop: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 32px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                        uploading || detecting || !file
                            ? "rgba(109,89,238,0.25)"
                            : "linear-gradient(135deg,#7c6ff0,#5a48d8)",
                    color: uploading || detecting || !file ? "rgba(255,255,255,0.4)" : "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: uploading || detecting || !file ? "not-allowed" : "pointer",
                    boxShadow: uploading || detecting || !file ? "none" : "0 6px 20px rgba(109,89,238,0.45)",
                    transition: "all 0.2s",
                }}
            >
                {uploading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Uploading…
                    </>
                ) : (
                    <>
                        <UploadCloud size={18} />
                        Upload PDF
                    </>
                )}
            </button>

            {/* Message */}
            {message && (
                <div
                    style={{
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        background:
                            messageType === "success" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
                        border: `1px solid ${
                            messageType === "success" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"
                        }`,
                        borderRadius: "12px",
                        padding: "14px 18px",
                        fontSize: "14px",
                        color: messageType === "success" ? "#6ee7b7" : "#f87171",
                    }}
                >
                    {messageType === "success" ? (
                        <CheckCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
                    ) : (
                        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
                    )}
                    {message}
                </div>
            )}
        </div>
    );
}

export default Upload;