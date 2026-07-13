import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../services/api";
import "./Chats.css";

function Chats() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getConversations();
                setConversations(data.conversations);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        return isToday
            ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
            : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };

    return (
        <div className="chats-page">
            <div className="chats-header">
                <button className="chat-back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back
                </button>
                <span className="chats-title">Your Chats</span>
            </div>

            <div className="chats-list">
                {loading ? (
                    <p className="loading_text">Loading conversations...</p>
                ) : conversations.length === 0 ? (
                    <p className="loading_text">No conversations yet.</p>
                ) : (
                    conversations.map((c) => (
                        <div
                            key={c.sessionId}
                            className="chat-list-item"
                            onClick={() => navigate(`/chat/${c.sessionId}`)}
                        >
                            <div className="chat-list-avatar">
                                {c.otherUserName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="chat-list-info">
                                <div className="chat-list-name">{c.otherUserName}</div>
                                <div className="chat-list-preview">{c.lastMessage}</div>
                            </div>
                            <div className="chat-list-time">
                                {formatTime(c.lastMessageTime)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Chats;