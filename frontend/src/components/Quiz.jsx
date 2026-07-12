import { useState } from "react";
import api from "../services/api";
import SubjectSelector from "./SubjectSelector";
import LoadingSpinner from "./LoadingSpinner";
import { useSubject } from "../context/SubjectContext";
import { ClipboardList, Sparkles, Check, X, RefreshCw, ChevronRight, CheckCircle2 } from "lucide-react";

function Quiz() {
    const { subject } = useSubject();
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(10);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionKey }
    const [showResults, setShowResults] = useState(false);
    const [rawError, setRawError] = useState("");

    const parseQuizJson = (text) => {
        let clean = text.trim();
        if (clean.includes("```json")) {
            clean = clean.split("```json")[1].split("```")[0];
        } else if (clean.includes("```")) {
            clean = clean.split("```")[1].split("```")[0];
        }
        return JSON.parse(clean.trim());
    };

    const generateQuiz = async () => {
        if (!subject) {
            setRawError("Please select a subject first.");
            return;
        }
        setLoading(true);
        setQuizQuestions([]);
        setRawError("");
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswers({});
        setShowResults(false);

        try {
            const res = await api.post("/quiz", { subject, count });
            const parsed = parseQuizJson(res.data.quiz);
            if (Array.isArray(parsed)) {
                setQuizQuestions(parsed);
            } else {
                throw new Error("Parsed data is not an array");
            }
        } catch (err) {
            console.error("Quiz generation error:", err);
            setRawError(err.response?.data?.detail || err.message || "Failed to generate interactive quiz.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerOptionClick = (questionIndex, optionKey) => {
        // Prevent changing answers
        if (selectedAnswers[questionIndex] !== undefined) return;

        const correctAns = quizQuestions[questionIndex].answer;
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: optionKey
        });

        if (optionKey === correctAns) {
            setScore((prev) => prev + 1);
        }
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswers({});
        setShowResults(false);
    };

    const totalQuestions = quizQuestions.length;
    const currentQuestion = quizQuestions[currentIndex];
    const isAnswered = selectedAnswers[currentIndex] !== undefined;

    return (
        <div style={{ padding: "36px 40px", maxWidth: "800px" }}>
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
                    <ClipboardList size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif" }}>
                        AI Quiz Game
                    </h1>
                    <p style={{ fontSize: "13px", color: "rgba(180,172,230,0.5)", marginTop: "3px" }}>
                        Generate interactive test questions with instant feedback
                    </p>
                </div>
            </div>

            {/* Configure section */}
            {quizQuestions.length === 0 && !loading && (
                <div
                    className="glass"
                    style={{
                        padding: "28px",
                        borderRadius: "16px",
                        border: "1px solid rgba(109,89,238,0.2)",
                        background: "rgba(255,255,255,0.02)",
                    }}
                >
                    <SubjectSelector />

                    {/* Question Count Select */}
                    <div style={{ marginBottom: "24px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: "rgba(180,172,230,0.75)",
                                marginBottom: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Number of Questions (default is 10)
                        </label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {[5, 10, 15, 20].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setCount(num)}
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "10px",
                                        border: "1px solid " + (count === num ? "#7c6ff0" : "rgba(109,89,238,0.2)"),
                                        background: count === num ? "rgba(124,111,240,0.15)" : "rgba(255,255,255,0.03)",
                                        color: count === num ? "#c0b7ff" : "rgba(180,172,230,0.7)",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={generateQuiz}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "14px 28px",
                            borderRadius: "12px",
                            border: "none",
                            background: "linear-gradient(135deg,#7c6ff0,#5a48d8)",
                            color: "#fff",
                            fontSize: "15px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 6px 20px rgba(109,89,238,0.4)",
                            transition: "all 0.2s",
                        }}
                    >
                        <Sparkles size={16} />
                        Start Quiz Challenge
                    </button>
                    {rawError && (
                        <p style={{ color: "#fa5c5c", fontSize: "14px", marginTop: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <X size={16} /> {rawError}
                        </p>
                    )}
                </div>
            )}

            {loading && (
                <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <LoadingSpinner />
                    <p style={{ color: "#a094f8", fontSize: "14px", fontWeight: 500 }}>Generating interactive quiz from your subject notes...</p>
                </div>
            )}

            {/* Quiz Game View */}
            {quizQuestions.length > 0 && !showResults && (
                <div>
                    {/* Score and Progress Bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{ fontSize: "14px", color: "rgba(180,172,230,0.6)" }}>
                            Question <span style={{ color: "#fff", fontWeight: 600 }}>{currentIndex + 1}</span> of {totalQuestions}
                        </span>
                        <span style={{ fontSize: "14px", color: "#a094f8", fontWeight: 600, background: "rgba(124,111,240,0.1)", padding: "4px 12px", borderRadius: "12px" }}>
                            Score: {score}
                        </span>
                    </div>

                    {/* Progress line */}
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "32px", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #7c6ff0, #a094f8)",
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>

                    {/* Card container */}
                    <div
                        className="glass"
                        style={{
                            padding: "32px",
                            borderRadius: "20px",
                            border: "1px solid rgba(124,111,240,0.25)",
                            background: "rgba(14,12,40,0.4)",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                        }}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", lineHeight: 1.6, marginBottom: "24px" }}>
                            {currentQuestion.question}
                        </h2>

                        {/* Options */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Object.entries(currentQuestion.options).map(([key, optText]) => {
                                const isSelected = selectedAnswers[currentIndex] === key;
                                const isCorrect = currentQuestion.answer === key;
                                const hasAnsweredCurr = selectedAnswers[currentIndex] !== undefined;

                                let optBg = "rgba(255,255,255,0.03)";
                                let optBorder = "1px solid rgba(109,89,238,0.2)";
                                let textColor = "#e8e4f8";
                                let badgeIcon = null;

                                if (hasAnsweredCurr) {
                                    if (isCorrect) {
                                        optBg = "rgba(52,211,153,0.12)";
                                        optBorder = "1px solid #34d399";
                                        textColor = "#6ee7b7";
                                        badgeIcon = <Check size={16} />;
                                    } else if (isSelected) {
                                        optBg = "rgba(240,87,87,0.12)";
                                        optBorder = "1px solid #f05757";
                                        textColor = "#fda4a4";
                                        badgeIcon = <X size={16} />;
                                    }
                                }

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleAnswerOptionClick(currentIndex, key)}
                                        disabled={hasAnsweredCurr}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "16px 20px",
                                            borderRadius: "14px",
                                            background: optBg,
                                            border: optBorder,
                                            color: textColor,
                                            fontSize: "14.5px",
                                            fontWeight: 500,
                                            cursor: hasAnsweredCurr ? "default" : "pointer",
                                            transition: "all 0.2s",
                                            outline: "none",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!hasAnsweredCurr) {
                                                e.currentTarget.style.borderColor = "#7c6ff0";
                                                e.currentTarget.style.background = "rgba(109,89,238,0.08)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!hasAnsweredCurr) {
                                                e.currentTarget.style.borderColor = "rgba(109,89,238,0.2)";
                                                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                            }
                                        }}
                                    >
                                        <span style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            <strong style={{ opacity: 0.6, textTransform: "uppercase" }}>{key}.</strong>
                                            <span>{optText}</span>
                                        </span>
                                        {badgeIcon}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Box */}
                        {isAnswered && (
                            <div
                                style={{
                                    marginTop: "28px",
                                    padding: "20px 24px",
                                    borderRadius: "14px",
                                    background: "rgba(124,111,240,0.06)",
                                    border: "1px solid rgba(124,111,240,0.15)",
                                    animation: "fade-in 0.3s ease",
                                }}
                            >
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#a094f8", marginBottom: "6px" }}>
                                    Explanation:
                                </p>
                                <p style={{ fontSize: "13.5px", color: "rgba(180,172,230,0.85)", lineHeight: 1.6 }}>
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                        <button
                            onClick={() => {
                                if (currentIndex > 0) setCurrentIndex((p) => p - 1);
                            }}
                            disabled={currentIndex === 0}
                            style={{
                                color: currentIndex === 0 ? "rgba(255,255,255,0.2)" : "#a094f8",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(109,89,238,0.15)",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                fontWeight: 600,
                            }}
                        >
                            Previous
                        </button>

                        {currentIndex < totalQuestions - 1 ? (
                            <button
                                onClick={() => setCurrentIndex((p) => p + 1)}
                                disabled={!isAnswered}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "#fff",
                                    background: !isAnswered ? "rgba(109,89,238,0.2)" : "linear-gradient(135deg,#7c6ff0,#5a48d8)",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: "10px",
                                    cursor: !isAnswered ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                }}
                            >
                                Next Question <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowResults(true)}
                                disabled={!isAnswered}
                                style={{
                                    color: "#fff",
                                    background: !isAnswered ? "rgba(109,89,238,0.2)" : "linear-gradient(135deg,#10b981,#059669)",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: "10px",
                                    cursor: !isAnswered ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                }}
                            >
                                Finish Practice
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Scorecard Screen */}
            {showResults && (
                <div
                    className="glass"
                    style={{
                        padding: "48px 32px",
                        textAlign: "center",
                        borderRadius: "20px",
                        border: "1px solid rgba(124,111,240,0.25)",
                        background: "rgba(14,12,40,0.4)",
                    }}
                >
                    <CheckCircle2 size={64} style={{ color: "#34d399", margin: "0 auto 24px" }} />
                    <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif" }}>
                        Quiz Complete!
                    </h2>
                    <p style={{ fontSize: "16px", color: "rgba(180,172,230,0.65)", marginTop: "8px", marginBottom: "32px" }}>
                        You scored <span style={{ color: "#34d399", fontWeight: 700 }}>{score}</span> out of{" "}
                        <span style={{ color: "#fff", fontWeight: 700 }}>{totalQuestions}</span> questions correctly!
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                        <button
                            onClick={resetQuiz}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "12px 24px",
                                borderRadius: "10px",
                                border: "1px solid rgba(109,89,238,0.3)",
                                background: "rgba(255,255,255,0.03)",
                                color: "#e8e4f8",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            <RefreshCw size={16} /> Replay
                        </button>
                        <button
                            onClick={() => setQuizQuestions([])}
                            style={{
                                padding: "12px 24px",
                                borderRadius: "10px",
                                border: "none",
                                background: "linear-gradient(135deg,#7c6ff0,#5a48d8)",
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Generate New Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Quiz;