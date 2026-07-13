import { useState, useEffect } from "react"
import { Link, NavLink ,useNavigate} from "react-router-dom"
import { getSessionRequests, confirmSession, cancelSession, getOwnProfile,withdrawSession } from "../services/api"
import "./dashboard.css"

function Requests() {
    const [myProfile, setMyProfile] = useState(null);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [activeTab, setActiveTab] = useState("incoming");
    const [loading, setLoading] = useState(true);
    const [actingOn, setActingOn] = useState(null);
     const [showDropdown, setShowDropdown] = useState(false); 
         const navigate = useNavigate();

    const loadRequests = async () => {
        try {
            const data = await getSessionRequests();
            setIncoming(data.incoming);
            setOutgoing(data.outgoing);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData] = await Promise.all([
                    getOwnProfile(),
                    loadRequests(),
                ]);
                setMyProfile(profileData.profile);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleAccept = async (sessionId) => {
        setActingOn(sessionId);
        try {
            await confirmSession(sessionId);
            await loadRequests();
        } catch (err) {
            console.error(err);
        } finally {
            setActingOn(null);
        }
    };

    const handleDecline = async (sessionId) => {
        setActingOn(sessionId);
        try {
            await cancelSession(sessionId);
            await loadRequests();
        } catch (err) {
            console.error(err);
        } finally {
            setActingOn(null);
        }
    };

    const handleWithdraw = async (sessionId) => {
        setActingOn(sessionId);
        try {
            await withdrawSession(sessionId);
            await loadRequests();
        } catch (err) {
            console.error(err);
        } finally {
            setActingOn(null);
        }
    };

    const dateLabel = (dt) =>
        new Date(dt).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
        const handleLogout = () => {
        localStorage.removeItem("token");   // match your actual key name
        navigate("/");
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav_logo">SkillSwap</div>
                <ul className="nav_links">
                    <li onClick={()=>navigate("/dashboard")} style={{ fontWeight: 600 }}>Dashboard</li>
                    <li onClick={()=>navigate("/browse")}>Broswser</li>
                    <li  onClick={()=>navigate( "/chats")}>Chats</li>
                     <li className="nav_avatar_wrapper">
                        <div className="nav_avatar" onClick={() => setShowDropdown(!showDropdown)}>
                        {myProfile?.userId?.name?.[0] || "A"}
                            
                        </div>
                        {showDropdown && (
                            <div className="dropdown_menu">
                                <div className="dropdown_item" onClick={() => navigate("/edit-profile")}>
                                    Edit Profile
                                </div>
                                <div className="dropdown_item" onClick={handleLogout}>
                                    Logout
                                </div>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="cardcontainer">

                <div className="greeting">Requests</div>
                <p className="greeting_sub">
                    Manage the session requests you've sent and received
                </p>

                {/* Tabs */}
                <div className="section_label" style={{ display: "flex", gap: "20px" }}>
                    <span
                        onClick={() => setActiveTab("incoming")}
                        style={{
                            cursor: "pointer",
                            opacity: activeTab === "incoming" ? 1 : 0.5,
                            textDecoration: activeTab === "incoming" ? "underline" : "none",
                        }}
                    >
                        📥 INCOMING {incoming.length > 0 ? `(${incoming.length})` : ""}
                    </span>
                    <span
                        onClick={() => setActiveTab("outgoing")}
                        style={{
                            cursor: "pointer",
                            opacity: activeTab === "outgoing" ? 1 : 0.5,
                            textDecoration: activeTab === "outgoing" ? "underline" : "none",
                        }}
                    >
                        📤 OUTGOING {outgoing.length > 0 ? `(${outgoing.length})` : ""}
                    </span>
                </div>

                <div className="sessions_container">
                    {loading ? (
                        <p className="loading_text">Loading requests...</p>
                    ) : activeTab === "incoming" ? (
                        incoming.length === 0 ? (
                            <p className="loading_text">No incoming requests right now.</p>
                        ) : (
                            incoming.map((req) => (
                                <div className="session_card" key={req.id}>
                                    <div className="session_left">
                                        <div className="session_avatar avatar_purple">
                                            {req.name[0].toUpperCase()}
                                        </div>
                                        <div className="session_info">
                                            <div className="session_title">
                                                {req.skill} with {req.name}
                                            </div>
                                            <div className="session_meta">
                                                {dateLabel(req.proposedDateTime)} ·{" "}
                                                {req.sessionType === "Paid" ? `₹${req.amount}` : "Free Swap"}
                                            </div>
                                            {req.message && (
                                                <div className="session_meta">"{req.message}"</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="session_right" style={{ gap: "8px", display: "flex" }}>
                                        <button
                                            className="session_btn session_btn_dark"
                                            disabled={actingOn === req.id}
                                            onClick={() => handleDecline(req.id)}
                                        >
                                            Decline
                                        </button>
                                        <button
                                            className="session_btn session_btn_gold"
                                            disabled={actingOn === req.id}
                                            onClick={() => handleAccept(req.id)}
                                        >
                                            {actingOn === req.id ? "..." : "Accept"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : outgoing.length === 0 ? (
                        <p className="loading_text">No outgoing requests waiting.</p>
                    ) : (
                        outgoing.map((req) => (
                            <div className="session_card" key={req.id}>
                                <div className="session_left">
                                    <div className="session_avatar avatar_purple">
                                        {req.name[0].toUpperCase()}
                                    </div>
                                    <div className="session_info">
                                        <div className="session_title">
                                            {req.skill} with {req.name}
                                        </div>
                                        <div className="session_meta">
                                            {dateLabel(req.proposedDateTime)} ·{" "}
                                            {req.sessionType === "Paid" ? `₹${req.amount}` : "Free Swap"}
                                        </div>
                                    </div>
                                </div>

                                <div className="session_right">
                                    <span className="session_status status_pending">
                                        Waiting for response
                                    </span>
                                    <button
                                        className="session_btn session_btn_dark"
                                        disabled={actingOn === req.id}
                                        onClick={() => handleWithdraw(req.id)}
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    )
}

export default Requests