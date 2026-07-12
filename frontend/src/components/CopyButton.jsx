import { useState } from "react";

function CopyButton({ content }) {

    const [copied, setCopied] = useState(false);

    const copyText = async () => {

        try {

            await navigator.clipboard.writeText(content);

            setCopied(true);

            setTimeout(() => {

                setCopied(false);

            }, 2000);

        }

        catch {

            alert("Failed to copy.");

        }

    };

    return (

        <button

            onClick={copyText}

            className={`px-5 py-3 rounded-xl transition font-semibold ${
                copied
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
            }`}

        >

            {copied ? "✅ Copied!" : "📋 Copy"}

        </button>

    );

}

export default CopyButton;