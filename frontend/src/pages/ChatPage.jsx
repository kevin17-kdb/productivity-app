import { useState } from "react";

import Chat from "../components/Chat";
import ConversationSidebar from "../components/ConversationSidebar";

function ChatPage() {

    const [selectedChat, setSelectedChat] = useState(null);

    const handleSelectChat = (chat) => {

        setSelectedChat(chat);

    };

    const handleNewChat = () => {

        setSelectedChat(null);

    };

    return (

        <div className="flex h-[calc(100vh-64px)]">

            <ConversationSidebar

                onSelectChat={handleSelectChat}

                onNewChat={handleNewChat}

            />

            <div className="flex-1 overflow-hidden">

                <Chat previousChat={selectedChat} />

            </div>

        </div>

    );

}

export default ChatPage;