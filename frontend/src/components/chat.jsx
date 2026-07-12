import { useState, useEffect, useRef } from "react";

import api from "../services/api";

import SubjectSelector from "./SubjectSelector";
import MessageBubble from "./MessageBubble";

import { exportChatPDF } from "../utils/exportChat";

function Chat({ previousChat }) {

    const [subject, setSubject] = useState("Probability");

    const [question, setQuestion] = useState("");

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);

    // ----------------------------------------
    // Load Previous Chat
    // ----------------------------------------

    useEffect(() => {

        if (!previousChat) {

            setMessages([]);

            return;

        }

        setSubject(previousChat.subject);

        setMessages([

            {

                sender: "user",

                text: previousChat.question

            },

            {

                sender: "ai",

                text: previousChat.answer,

                question: previousChat.question

            }

        ]);

    }, [previousChat]);

    // ----------------------------------------
    // Auto Scroll
    // ----------------------------------------

    useEffect(() => {

        chatEndRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages, loading]);

    // ----------------------------------------
    // Ask AI
    // ----------------------------------------

    const askQuestion = async () => {

        if (!question.trim()) return;

        const currentQuestion = question;

        setMessages((prev) => [

            ...prev,

            {

                sender: "user",

                text: currentQuestion

            }

        ]);

        setQuestion("");

        setLoading(true);

        try {

            const response = await api.post(

                "/chat",

                {

                    subject,

                    question: currentQuestion

                }

            );

            setMessages((prev) => [

                ...prev,

                {

                    sender: "ai",

                    text: response.data.answer,

                    question: currentQuestion

                }

            ]);

        }

        catch (err) {

            setMessages((prev) => [

                ...prev,

                {

                    sender: "ai",

                    text:

                        err.response?.data?.detail ||

                        "Something went wrong.",

                    question: currentQuestion

                }

            ]);

        }

        finally {

            setLoading(false);

        }

    };

    // ----------------------------------------
    // Regenerate Answer
    // ----------------------------------------

    const regenerateAnswer = async (

        originalQuestion,

        index

    ) => {

        if (!originalQuestion) return;

        setLoading(true);

        try {

            const response = await api.post(

                "/chat",

                {

                    subject,

                    question: originalQuestion

                }

            );

            setMessages((prev) => {

                const updated = [...prev];

                updated[index] = {

                    ...updated[index],

                    text: response.data.answer

                };

                return updated;

            });

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="max-w-6xl mx-auto flex flex-col h-full">

            {/* Header */}

            <div className="flex justify-between items-center mb-6">

                <h1 className="text-4xl font-bold">

                    💬 AI Study Assistant

                </h1>

                <button

                    onClick={() => exportChatPDF(messages)}

                    disabled={messages.length === 0}

                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 px-5 py-3 rounded-xl transition"

                >

                    📄 Export PDF

                </button>

            </div>

            {/* Subject */}

            <SubjectSelector

                subject={subject}

                setSubject={setSubject}

            />

            {/* Chat Window */}

            <div className="flex-1 bg-slate-900 rounded-xl shadow-lg p-6 overflow-y-auto mt-5">

                {

                    messages.length === 0 && !loading && (

                        <div className="text-center mt-24">

                            <h2 className="text-3xl font-bold">

                                Welcome to StudyMate AI 👋

                            </h2>

                            <p className="text-gray-400 mt-4">

                                Upload your notes and ask anything.

                            </p>

                        </div>

                    )

                }

                {

                    messages.map((msg, index) => (

                        <MessageBubble

                            key={index}

                            message={msg}

                            onRegenerate={

                                msg.sender === "ai"

                                    ?

                                    () => regenerateAnswer(

                                        msg.question,

                                        index

                                    )

                                    :

                                    undefined

                            }

                        />

                    ))

                }

                {

                    loading && (

                        <div className="flex justify-start">

                            <div className="bg-slate-800 rounded-xl px-5 py-3 animate-pulse">

                                🤖 StudyMate AI is thinking...

                            </div>

                        </div>

                    )

                }

                <div ref={chatEndRef}></div>

            </div>

            {/* Input */}

            <div className="flex items-end gap-4 mt-5">

                <textarea

                    rows={2}

                    value={question}

                    onChange={(e) =>

                        setQuestion(e.target.value)

                    }

                    onKeyDown={(e) => {

                        if (

                            e.key === "Enter" &&

                            !e.shiftKey

                        ) {

                            e.preventDefault();

                            askQuestion();

                        }

                    }}

                    placeholder="Message StudyMate AI..."

                    className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500"

                />

                <button

                    onClick={askQuestion}

                    disabled={loading}

                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl px-8 py-4 font-semibold transition"

                >

                    ➤

                </button>

            </div>

        </div>

    );

}

export default Chat;