import { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

function MessageBubble({

    message,

    onRegenerate

}) {

    const [copied, setCopied] = useState(false);

    const copyText = async () => {

        await navigator.clipboard.writeText(

            message.text

        );

        setCopied(true);

        setTimeout(() => {

            setCopied(false);

        }, 1500);

    };

    return (

        <div

            className={`flex mb-5 ${

                message.sender === "user"

                    ? "justify-end"

                    : "justify-start"

            }`}

        >

            <div

                className={`max-w-[80%] rounded-xl p-4 shadow ${

                    message.sender === "user"

                        ? "bg-blue-600 text-white"

                        : "bg-slate-800 text-white"

                }`}

            >

                <ReactMarkdown

                    remarkPlugins={[

                        remarkGfm,

                        remarkMath

                    ]}

                    rehypePlugins={[

                        rehypeKatex

                    ]}

                >

                    {message.text}

                </ReactMarkdown>

                {

                    message.sender === "ai" && (

                        <div className="flex gap-6 mt-4">

                            <button

                                onClick={copyText}

                                className="text-blue-400 hover:text-blue-300 text-sm"

                            >

                                {

                                    copied

                                    ?

                                    "✅ Copied!"

                                    :

                                    "📋 Copy"

                                }

                            </button>

                            <button

                                onClick={onRegenerate}

                                className="text-green-400 hover:text-green-300 text-sm"

                            >

                                🔄 Regenerate

                            </button>

                        </div>

                    )

                }

            </div>

        </div>

    );

}

export default MessageBubble;