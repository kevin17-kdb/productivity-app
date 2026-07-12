import { useState } from "react";
import Chat from "../components/Chat";
import ConversationSidebar from "../components/ConversationSidebar";

function ChatPage() {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <ConversationSidebar
                onSelectChat={setSelectedChat}
                onNewChat={() => setSelectedChat(null)}
            />
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <Chat previousChat={selectedChat} />
            </div>
        </div>
    );
}

export default ChatPage;