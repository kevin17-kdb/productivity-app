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

function Flashcards() {

    const { subject } = useSubject();

    const [flashcards, setFlashcards] = useState("");

    const [loading, setLoading] = useState(false);

    const generateFlashcards = async () => {

        setLoading(true);
        setFlashcards("");

        try {

            const response = await axios.post(

                "http://127.0.0.1:8000/flashcards",

                {
                    subject
                }

            );

            setFlashcards(response.data.flashcards);

        }

        catch (err) {

            if (err.response?.data?.error) {

                setFlashcards(err.response.data.error);

            }

            else {

                setFlashcards("Something went wrong.");

            }

        }

        setLoading(false);

    };

    return (

        <div className="max-w-6xl mx-auto text-white">

            <h1 className="text-5xl font-bold mb-8">

                🧠 AI Flashcards

            </h1>

            <SubjectSelector />

            <p className="text-gray-400 mb-5">

                Current Subject:

                <span className="text-purple-400 font-bold">

                    {" "}{subject}

                </span>

            </p>

            <button

                onClick={generateFlashcards}

                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition"

            >

                Generate Flashcards

            </button>

            {

                loading &&

                <div className="mt-8">

                    <LoadingSpinner />

                </div>

            }

            {

                flashcards &&

                <>

                    <div className="flex justify-end gap-3 mt-8 mb-4">

                        <CopyButton

                            content={flashcards}

                        />

                        <DownloadButton

                            title={`${subject} Flashcards`}

                            content={flashcards}

                        />

                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-lg p-6">

                        <ReactMarkdown

                            remarkPlugins={[remarkGfm, remarkMath]}

                            rehypePlugins={[rehypeKatex]}

                        >

                            {flashcards}

                        </ReactMarkdown>

                    </div>

                </>

            }

        </div>

    );

}

export default Flashcards;