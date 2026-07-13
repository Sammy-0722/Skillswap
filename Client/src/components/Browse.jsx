import { getAllProfiles, requestSession, getOwnProfile } from "../services/api"
import { useState, useEffect, Profiler } from "react";
import { Link, useNavigate } from "react-router-dom"
import "./Browse.css"

function Browser() {
    const [Profiles, setProfiles] = useState([]);
    const [MyProfile, setMyProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
     const [showDropdown, setShowDropdown] = useState(false);

    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();
    // request model
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [proposedDateTime, setProposedDateTime] = useState("");
    const [requestsession, setrequestsession] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");
   

    const loadData = async () => {
        try {
            const mydata = await getOwnProfile();
            setMyProfile(mydata.profile || null);
            const data = await getAllProfiles();
            setProfiles(data.profiles || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);
    const openRequestModal = (profile) => {
        setSelectedProfile(profile);
        setProposedDateTime("");
        setRequestMessage("");
        setModalError("");
    };
    const closeModel = () => {
        setSelectedProfile(null);
    }

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
                selectedProfile.userId,
                selectedProfile.skillsToTeach[0],
                proposedDateTime,
                selectedProfile.sessionType,
                requestMessage,

            );

            closeModel();
        } catch (err) {
            setModalError(err.response?.data?.error || "Failed to send request.");
        } finally {
            setSubmitting(false);
        }
    }
    const filteredProfiles = Profiles.filter((profile) => {
        if (searchTerm.trim() === "") return true;
        return profile.skillsToTeach?.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
                    <li ><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/requests">Requests</Link></li>

                    <li className="nav_avatar_wrapper">
                        <div className="nav_avatar" onClick={() => setShowDropdown(!showDropdown)}>
                            {MyProfile?.userId?.name?.[0] || ""}
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
            <div className="browse_page">
                <div className="browse_title">Browse Skills</div>

                <div className="search_bar">
                    <input
                        type="text"
                        className="search_input"
                        placeholder="Search by skill — React, Guitar, Python..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                </div>

                <div className="card_container">
                    {loading ? (
                        <p className="loading_text">Loading profiles...</p>
                    ) : filteredProfiles.length === 0 ? (
                        <p className="loading_text">No profiles found.</p>
                    ) : (
                        filteredProfiles.map((profile) => (
                            <div key={profile._id} className="card">

                                {/* top row: avatar + name/location on left, rating on right */}
                                <div className="card_top">
                                    <div className="profile">
                                        <div className="avataar">
                                            {profile.userId?.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div className="profile_info">
                                            <div className="profile_name">{profile.userId?.name}</div>
                                            <div className="profile_location">{profile.location}</div>
                                        </div>
                                    </div>

                                </div>

                                {/* skill tags */}
                                <div className="tag_row">
                                    {profile.skillsToTeach?.map((skill) => (
                                        <span key={skill} className="tag">{skill}</span>
                                    ))}
                                </div>

                                {/* wants to learn line */}
                                <div className="wants_to_learn">
                                    Wants to learn: <span>{profile.skillsToLearn?.join(", ")}</span>
                                </div>

                                {/* divider + footer */}
                                <div className="card_footer">
                                    <div className={`session_type ${profile.sessionType === "Paid" ? "paid" : "free"}`}>
                                        {profile.sessionType === "Paid" ? "Paid" : "Free Swap ✓"}
                                    </div>
                                    <button className="request_btn" onClick={() => openRequestModal(profile)}>Request Session</button>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="card_container">
                {selectedProfile &&

                    <div className="modal_overlay">
                        <div className="modal_box" >
                            <h3 className="modal_title">
                                Request a session with {selectedProfile.userId.name}
                            </h3>
                            <p className="modal_sub">
                                {selectedProfile.skillsToTeach.join(", ")} · {selectedProfile.sessionType}
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
                                    <button type="button" className="session_btn session_btn_dark" onClick={closeModel}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={submitting}>
                                        {submitting ? "Sending..." : "Send Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                }

            </div>

        </>
    )
}

export default Browser