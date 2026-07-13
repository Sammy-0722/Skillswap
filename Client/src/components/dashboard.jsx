import { useState, useEffect } from "react"
import { getMatches, getOwnProfile, getUpcomingSessions, requestSession, createOrder, verifyPayment  } from "../services/api"
import "./dashboard.css"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [myProfile, setMyProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
     const [showDropdown, setShowDropdown] = useState(false);

    // Request modal state
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [proposedDateTime, setProposedDateTime] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");
    const navigate = useNavigate();
    

    const loadSessions = async () => {
        try {
            const sessionData = await getUpcomingSessions();
            setSessions(sessionData.sessions);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const profileData = await getOwnProfile();
                setMyProfile(profileData.profile);

                const [matchData, sessionData] = await Promise.all([
                    getMatches(),
                    getUpcomingSessions(),
                ]);

                setMatches(matchData.matches);
                setSessions(sessionData.sessions);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // ---------- Request modal handlers ----------
    const openRequestModal = (match) => {
        setSelectedMatch(match);
        setProposedDateTime("");
        setRequestMessage("");
        setModalError("");
    };

    const closeModal = () => {
        setSelectedMatch(null);
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!proposedDateTime) {
            setModalError("Please pick a date and time.");
            return;
        }
        setSubmitting(true);
        setModalError("");
        try {
            await requestSession(
                selectedMatch.userId,
                selectedMatch.skillsToTeach[0],
                proposedDateTime,
                selectedMatch.sessionType,
                requestMessage,
                selectedMatch.sessionType === "Paid" ? selectedMatch.amount || 0 : 0
            );
            await loadSessions();
            closeModal();
        } catch (err) {
            setModalError(err.response?.data?.error || "Failed to send request.");
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Pay Now handler ----------
    const handlePayNow = async (sessionId) => {
    try {
        const { orderId, amount, keyId } = await createOrder(sessionId);

        const options = {
            key: keyId,
            amount: amount,
            currency: "INR",
            name: "SkillSwap",
            description: "Session payment",
            order_id: orderId,
            handler: async (response) => {
                try {
                    await verifyPayment(sessionId, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    await loadSessions();
                } catch (err) {
                    console.error(err);
                }
            },
            theme: { color: "#6366f1" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (err) {
        console.error(err);
    }
};
const handleLogout = () => {
        localStorage.removeItem("token");   // match your actual key name
        navigate("/");
    };
    return (
        <>  
            <nav className="navbar">
                <div className="nav_logo">SkillSwap</div>
                <ul className="nav_links">
                    <li onClick={()=>navigate("/browse")}>Browse</li>
                    <li onClick={()=>navigate("/requests")}>Requests</li>
                    <li onClick={() => navigate("/chats")}>Chat</li>
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

                {/* Greeting */}
                <div className="greeting">
                    Good morning, {myProfile?.userId?.name || "there"}
                </div>
                <p className="greeting_sub">
                    Here's what's happening with your skill journey
                </p>

                {/* AI Matching Banner */}
                <div className="aimatching">
                    <div className="aimatching_left">
                        <div className="ai_active">
                            <span className="ai_dot"></span>
                            AI MATCHING ACTIVE
                        </div>
                        <p className="ai_title">
                            Found {matches.length} great matches for you today
                        </p>
                        <p className="ai_sub">
                            Based on your goals — these people teach what you want to learn
                        </p>
                    </div>
                    <button className="view_btn"onClick={()=>navigate('/browse')}>View Matches →</button>
                </div>

                {/* AI Suggested Matches */}
                <div className="section_label">🤖 AI SUGGESTED MATCHES</div>

                <div className="profile_card_container">
                    {loading ? (
                        <p className="loading_text">Finding your matches...</p>
                    ) : matches.length === 0 ? (
                        <p className="loading_text">
                            No matches found yet — add more skills to learn!
                        </p>
                    ) : (
                        matches.map((match, index) => (
                            <div className="profile_card" key={match.userId || index}>

                                <div className="profile">
                                    <div className="avatar">
                                        {match.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div className="profile_intro">
                                        <div className="profile_name">{match.name}</div>
                                        <div className="profile_location">{match.location}</div>
                                    </div>
                                </div>

                                <div className="profile_teaches">
                                    Teaches: <span>{match.skillsToTeach.join(", ")}</span>
                                </div>

                                <div className="profile_learn">
                                    Wants: <span>{match.skillsToLearn.join(", ")}</span>
                                </div>

                                <div className="ai_reason">
                                    💡 {match.aiReason}
                                </div>

                                <div className="line"></div>

                                <div className="profile_card_footer">
                                    <div className="session_type"> {match.sessionType === "Paid" && match.hourlyRate ? ` · ₹${match.hourlyRate}/hr` : ""}</div>
                                    
                                    <button
                                        className="request_btn"
                                        onClick={() => openRequestModal(match)}
                                    >
                                        Request
                                    </button>
                                </div>

                            </div>
                        ))
                    )}
                </div>

                {/* Upcoming Sessions */}
                <div className="section_label">📅 YOUR UPCOMING SESSIONS</div>

                <div className="sessions_container">
                    {sessions.length === 0 ? (
                        <p className="loading_text">No upcoming sessions yet.</p>
                    ) : (
                        sessions.map((session) => {
                            const isConfirmed = session.status === "confirmed";
                            const needsPayment =
                                isConfirmed && session.paymentStatus === "pending";

                            let statusLabel = "Awaiting Confirmation";
                            let statusClass = "status_pending";
                            let actionButton = null;

                            if (isConfirmed && !needsPayment) {
                                statusLabel = "Confirmed";
                                statusClass = "status_confirmed";
                                actionButton = (
                                    <button className="session_btn session_btn_dark" onClick={() => navigate(`/chat/${session.id}`)}>
                                        Open Chat
                                    </button>
                                );
                            } else if (needsPayment) {
                                statusLabel = "Pending Payment";
                                statusClass = "status_pending";
                                actionButton = session.isSender ? (
                                    <button
                                        className="session_btn session_btn_gold"
                                        onClick={() => handlePayNow(session.id)}
                                    >
                                        Pay Now
                                    </button>
                                ) : (
                                    <span className="session_meta">Awaiting their payment</span>
                                );
                            }

                            const dateLabel = new Date(session.proposedDateTime).toLocaleString(
                                undefined,
                                { weekday: "short", hour: "numeric", minute: "2-digit" }
                            );

                            return (
                                <div className="session_card" key={session.id}>
                                    <div className="session_left">
                                        <div className="session_avatar avatar_purple">
                                            {session.name[0].toUpperCase()}
                                        </div>
                                        <div className="session_info">
                                            <div className="session_title">
                                                {session.skill} with {session.name}
                                            </div>
                                            <div className="session_meta">
                                                {dateLabel} · {session.sessionType === "Paid" ? `₹${session.amount}` : "Free Swap"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="session_right">
                                        <span className={`session_status ${statusClass}`}>
                                            {statusLabel}
                                        </span>
                                        {actionButton}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* Request Modal */}
            {selectedMatch && (
                <div className="modal_overlay" onClick={closeModal}>
                    <div className="modal_box" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal_title">
                            Request a session with {selectedMatch.name}
                        </h3>
                        <p className="modal_sub">
                            {selectedMatch.skillsToTeach.join(", ")} · {selectedMatch.sessionType}
                        </p>

                        <form onSubmit={handleSubmitRequest}>
                            <label className="field-label">Proposed date & time</label>
                            <input
                                type="datetime-local"
                                className="field-input"
                                value={proposedDateTime}
                                onChange={(e) => setProposedDateTime(e.target.value)}
                            />

                            <label className="field-label" style={{ marginTop: "16px", display: "block" }}>
                                Message (optional)
                            </label>
                            <textarea
                                className="field-textarea"
                                rows={3}
                                placeholder="Say hi, or add any context..."
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                            />

                            {modalError && <p className="setup-msg setup-msg-error">{modalError}</p>}

                            <div className="modal_actions">
                                <button type="button" className="session_btn session_btn_dark" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? "Sending..." : "Send Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Dashboard