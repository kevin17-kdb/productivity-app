import { useEffect, useState } from "react";
import api from "../services/api";

function ChatHistoryPage() {

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadHistory();

    }, []);

    const loadHistory = async () => {

        try {

            const response = await api.get(

                "/chat-history"

            );

            setHistory(response.data);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="flex justify-center items-center h-screen">

                Loading...

            </div>

        );

    }

    return (

        <div className="max-w-6xl mx-auto p-8">

            <h1 className="text-4xl font-bold mb-8">

                💬 Chat History

            </h1>

            {

                history.length === 0 &&

                <div className="text-center mt-20">

                    <h2 className="text-2xl">

                        No conversations yet.

                    </h2>

                </div>

            }

            <div className="space-y-6">

                {

                    history.map((chat) => (

                        <div

                            key={chat.id}

                            className="bg-slate-900 rounded-xl p-6"

                        >

                            <div className="flex justify-between">

                                <div>

                                    <h2 className="text-xl font-bold">

                                        {chat.title || chat.question}

                                    </h2>

                                    <p className="text-blue-400">

                                        {chat.subject}

                                    </p>

                                </div>

                                <p className="text-gray-400 text-sm">

                                    {

                                        chat.created_at

                                            ?

                                            new Date(

                                                chat.created_at

                                            ).toLocaleString()

                                            :

                                            ""

                                    }

                                </p>

                            </div>

                            <div className="mt-6">

                                <h3 className="font-semibold">

                                    🙋 Question

                                </h3>

                                <p className="mt-2">

                                    {chat.question}

                                </p>

                            </div>

                            <div className="mt-6">

                                <h3 className="font-semibold">

                                    🤖 Answer

                                </h3>

                                <div className="mt-2 whitespace-pre-wrap">

                                    {chat.answer}

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default ChatHistoryPage;