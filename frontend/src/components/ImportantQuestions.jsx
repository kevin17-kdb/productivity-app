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

function ImportantQuestions() {

    const { subject } = useSubject();

    const [questions, setQuestions] = useState("");

    const [loading, setLoading] = useState(false);

    const generateQuestions = async () => {

        setLoading(true);
        setQuestions("");

        try {

            const response = await axios.post(

                "http://127.0.0.1:8000/important-questions",

                {
                    subject
                }

            );

            setQuestions(response.data.questions);

        }

        catch (err) {

            if (err.response?.data?.error) {

                setQuestions(err.response.data.error);

            }

            else {

                setQuestions("Something went wrong.");

            }

        }

        setLoading(false);

    };

    return (

        <div className="max-w-6xl mx-auto text-white">

            <h1 className="text-5xl font-bold mb-8">

                ⭐ Important Questions

            </h1>

            <SubjectSelector />

            <p className="text-gray-400 mb-5">

                Current Subject:

                <span className="text-orange-400 font-bold">

                    {" "}{subject}

                </span>

            </p>

            <button

                onClick={generateQuestions}

                className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl transition"

            >

                Generate Questions

            </button>

            {

                loading &&

                <div className="mt-8">

                    <LoadingSpinner />

                </div>

            }

            {

                questions &&

                <>

                    <div className="flex justify-end gap-3 mt-8 mb-4">

                        <CopyButton

                            content={questions}

                        />

                        <DownloadButton

                            title={`${subject} Important Questions`}

                            content={questions}

                        />

                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-lg p-6">

                        <ReactMarkdown

                            remarkPlugins={[remarkGfm, remarkMath]}

                            rehypePlugins={[rehypeKatex]}

                        >

                            {questions}

                        </ReactMarkdown>

                    </div>

                </>

            }

        </div>

    );

}

export default ImportantQuestions;