import { useEffect, useState } from "react";

function TypewriterText({ text, speed = 15 }) {

    const [displayText, setDisplayText] = useState("");

    useEffect(() => {

        setDisplayText("");

        let index = 0;

        const interval = setInterval(() => {

            index++;

            setDisplayText(text.slice(0, index));

            if (index >= text.length) {

                clearInterval(interval);

            }

        }, speed);

        return () => clearInterval(interval);

    }, [text, speed]);

    return (

        <span>

            {displayText}

        </span>

    );

}

export default TypewriterText;
