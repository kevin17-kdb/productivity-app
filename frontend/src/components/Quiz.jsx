import { useState } from "react";
import axios from "axios";

import SubjectSelector from "./SubjectSelector";
import LoadingSpinner from "./LoadingSpinner";
import DownloadButton from "./DownloadButton";
import CopyButton from "./CopyButton";

import { useSubject } from "../context/SubjectContext";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

function Quiz() {

    const { subject } = useSubject();

    const [quiz, setQuiz] = useState("");

    const [loading, setLoading] = useState(false);

    const generateQuiz = async () => {

        setLoading(true);
        setQuiz("");

        try {

            const response = await axios.post(

                "http://127.0.0.1:8000/quiz",

                {
                    subject
                }

            );

            setQuiz(response.data.quiz);

        }

        catch (err) {

            if (err.response?.data?.error) {

                setQuiz(err.response.data.error);

            }

            else {

                setQuiz("Something went wrong.");

            }

        }

        setLoading(false);

    };

    return (

        <div className="max-w-6xl mx-auto text-white">

            <h1 className="text-5xl font-bold mb-8">

                📝 AI Quiz Generator

            </h1>

            <SubjectSelector />

            <p className="text-gray-400 mb-5">

                Current Subject:

                <span className="text-blue-400 font-bold">

                    {" "}{subject}

                </span>

            </p>

            <button

                onClick={generateQuiz}

                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition"

            >

                Generate Quiz

            </button>

            {

                loading &&

                <div className="mt-8">

                    <LoadingSpinner />

                </div>

            }

            {

                quiz &&

                <>

                    <div className="flex justify-end gap-3 mt-8 mb-4">

                        <CopyButton

                            content={quiz}

                        />

                        <DownloadButton

                            title={`${subject} Quiz`}

                            content={quiz}

                        />

                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-lg p-6">

                        <ReactMarkdown

                            remarkPlugins={[remarkGfm, remarkMath]}

                            rehypePlugins={[rehypeKatex]}

                        >

                            {quiz}

                        </ReactMarkdown>

                    </div>

                </>

            }

        </div>

    );

}

export default Quiz;