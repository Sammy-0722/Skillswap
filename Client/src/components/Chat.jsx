import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChatHistory, deleteChat } from "../services/api";
import { getSocket } from "../services/socket";
import "./Chat.css";

function Chat() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const myUserId = localStorage.getItem("userId");
    const bottomRef = useRef(null);

    useEffect(() => {
        const socket = getSocket();

        const loadHistory = async () => {
            try {
                const data = await getChatHistory(sessionId);
                setMessages(data.messages);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();

        socket.emit("join_session", sessionId);

        const handleIncoming = (message) => {
            setMessages((prev) => [...prev, message]);
        };
        socket.on("receive_message", handleIncoming);

        return () => {
            socket.off("receive_message", handleIncoming);
        };
    }, [sessionId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleDeleteChat = async () => {
        const confirmed = window.confirm(
            "Delete this entire chat? This cannot be undone."
        );
        if (!confirmed) return;

        try {
            await deleteChat(sessionId);
            navigate("/chats");
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const socket = getSocket();
        socket.emit("send_message", { sessionId, text });
        setText("");
    };

    return (
        <div className="chat-page">
            <div className="chat-header">
                <button className="chat-back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back
                </button>
                <span className="chat-title">Session Chat</span>
                <button className="chat-delete-btn" onClick={handleDeleteChat}>
                    Delete Chat
                </button>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <p className="loading_text">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="loading_text">No messages yet — say hi!</p>
                ) : (
                    messages.map((m) => {
                        const isMine = m.senderId === myUserId;
                        return (
                            <div
                                key={m.id}
                                className={`chat-bubble-row ${isMine ? "mine" : "theirs"}`}
                            >
                                <div className={`chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                                    {m.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef}></div>
            </div>

            <form className="chat-input-row" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="chat-send-btn">Send</button>
            </form>
        </div>
    );
}

export default Chat;