import { useEffect, useState } from "react";
import api from "../services/api";

function ConversationSidebar({

    onSelectChat,

    onNewChat

}) {

    const [history, setHistory] = useState([]);

    const [search, setSearch] = useState("");

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

    const deleteConversation = async (id) => {

        const confirmed = window.confirm(

            "Delete this conversation?"

        );

        if (!confirmed) return;

        try {

            await api.delete(

                `/chat-history/${id}`

            );

            setHistory((prev) =>

                prev.filter((chat) => chat.id !== id)

            );

        }

        catch (err) {

            console.log(err);

        }

    };

    const renameConversation = async (chat) => {

        const newTitle = window.prompt(

            "Rename Conversation",

            chat.title || chat.question

        );

        if (!newTitle) return;

        try {

            await api.put(

                `/chat-history/${chat.id}`,

                {

                    title: newTitle

                }

            );

            setHistory((prev) =>

                prev.map((item) =>

                    item.id === chat.id

                        ? {

                              ...item,

                              title: newTitle

                          }

                        : item

                )

            );

        }

        catch (err) {

            console.log(err);

        }

    };

    const filteredHistory = history.filter((chat) => {

        const title =

            (chat.title || chat.question)

                .toLowerCase();

        return (

            title.includes(

                search.toLowerCase()

            ) ||

            chat.subject

                .toLowerCase()

                .includes(search.toLowerCase())

        );

    });

    return (

        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">

            {/* New Chat */}

            <div className="p-5">

                <button

                    onClick={onNewChat}

                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold"

                >

                    + New Chat

                </button>

            </div>

            {/* Search */}

            <div className="px-4 pb-4">

                <input

                    type="text"

                    value={search}

                    onChange={(e) =>

                        setSearch(e.target.value)

                    }

                    placeholder="🔍 Search conversations"

                    className="w-full bg-slate-800 rounded-lg p-3 outline-none"

                />

            </div>

            {/* Conversation List */}

            <div className="flex-1 overflow-y-auto px-4">

                {

                    loading && (

                        <p className="text-center text-gray-400">

                            Loading...

                        </p>

                    )

                }

                {

                    !loading &&

                    filteredHistory.length === 0 && (

                        <p className="text-center text-gray-400">

                            No conversations found.

                        </p>

                    )

                }

                {

                    filteredHistory.map((chat) => (

                        <div

                            key={chat.id}

                            className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 mb-3 transition"

                        >

                            <div className="flex justify-between items-start">

                                <div

                                    className="cursor-pointer flex-1"

                                    onClick={() =>

                                        onSelectChat(chat)

                                    }

                                >

                                    <p className="text-xs text-blue-400">

                                        {chat.subject}

                                    </p>

                                    <h3 className="font-semibold truncate">

                                        {

                                            chat.title ||

                                            chat.question

                                        }

                                    </h3>

                                    <p className="text-xs text-gray-400 truncate">

                                        {chat.question}

                                    </p>

                                </div>

                                <div className="flex gap-2">

                                    <button

                                        onClick={(e) => {

                                            e.stopPropagation();

                                            renameConversation(chat);

                                        }}

                                        className="text-yellow-400 hover:text-yellow-500"

                                        title="Rename"

                                    >

                                        ✏️

                                    </button>

                                    <button

                                        onClick={(e) => {

                                            e.stopPropagation();

                                            deleteConversation(chat.id);

                                        }}

                                        className="text-red-400 hover:text-red-500"

                                        title="Delete"

                                    >

                                        🗑️

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default ConversationSidebar;