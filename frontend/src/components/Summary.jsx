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

function Summary() {

    const { subject } = useSubject();

    const [summary, setSummary] = useState("");

    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {

        setLoading(true);

        setSummary("");

        try {

            const response = await axios.post(

                "http://127.0.0.1:8000/summary",

                {
                    subject
                }

            );

            setSummary(response.data.summary);

        }

        catch (err) {

            if (err.response?.data?.error) {

                setSummary(err.response.data.error);

            }

            else {

                setSummary("Something went wrong.");

            }

        }

        setLoading(false);

    };

    return (

        <div className="max-w-6xl mx-auto text-white">

            <h1 className="text-5xl font-bold mb-8">

                📚 AI Summary Generator

            </h1>

            <SubjectSelector />

            <p className="text-gray-400 mb-5">

                Current Subject:

                <span className="text-green-400 font-bold">

                    {" "}{subject}

                </span>

            </p>

            <button

                onClick={generateSummary}

                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl transition"

            >

                Generate Summary

            </button>

            {

                loading &&

                <div className="mt-8">

                    <LoadingSpinner />

                </div>

            }

            {

                summary &&

                <>

                    <div className="flex justify-end gap-3 mt-8 mb-4">

                        <CopyButton

                            content={summary}

                        />

                        <DownloadButton

                            title={`${subject} Summary`}

                            content={summary}

                        />

                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-lg p-6">

                        <ReactMarkdown

                            remarkPlugins={[remarkGfm, remarkMath]}

                            rehypePlugins={[rehypeKatex]}

                        >

                            {summary}

                        </ReactMarkdown>

                    </div>

                </>

            }

        </div>

    );

}

export default Summary;