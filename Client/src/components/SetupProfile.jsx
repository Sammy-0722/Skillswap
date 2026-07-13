import { setupProfile } from "../services/api"
import { useState } from "react"
import './SetupProfile.css'
import { useNavigate } from "react-router-dom";

function SetupProfile() {
    const [bio, setbio] = useState('');
    const [location, setlocation] = useState('');
    const [skillInputTeach, setSkillInputTeach] = useState('');
    const [skillListTeach, setSkillListTeach] = useState([]);
    const [skill_to_Learn, setSkill_to_Learn] = useState('');
    const [skill_List_learn, setSkill_List_learn] = useState([]);
    const [availability, setAvailability] = useState('');
    const [sessionType, setSessionType] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isloading, setLoading] = useState(false);
    const naviagate = useNavigate();

    const handleAddTeachSkill = (e) => {
        e.preventDefault();
        if (!skillInputTeach.trim()) return;
        setSkillListTeach([...skillListTeach, skillInputTeach.trim()]);
        setSkillInputTeach("");
    };

    const handleAddLearnSkill = (e) => {
        e.preventDefault();
        if (!skill_to_Learn.trim()) return;
        setSkill_List_learn([...skill_List_learn, skill_to_Learn.trim()]);
        setSkill_to_Learn("");
    };

    const handleRemoveTeachSkill = (indexToRemove) => {
        setSkillListTeach(skillListTeach.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveLearnSkill = (indexToRemove) => {
        setSkill_List_learn(skill_List_learn.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!bio || !location) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            await setupProfile(bio, location, skillListTeach, skill_List_learn, availability, sessionType,hourlyRate ? Number(hourlyRate) : 0);
            setSuccess("Profile saved successfully!");
            naviagate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-page">

            <div className="setup-eyebrow">
                <span className="eyebrow-dash"></span>
                CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; TEACH
            </div>

            <h1 className="setup-heading">
                Complete Your <em>Profile</em>
            </h1>
            <p className="setup-subtext">
                This is what other users will see. Fill it well — it's your first impression.
            </p>

            <form className="setup-form" onSubmit={handleSubmit}>

                <div className="field-block">
                    <label className="field-label">Bio — tell people who you are</label>
                    {/* textarea instead of input — drag the bottom-right corner to expand */}
                    <textarea
                        placeholder="Write about yourself..."
                        value={bio}
                        onChange={(e) => setbio(e.target.value)}
                        className="field-textarea"
                        rows={3}
                    />
                </div>

                <div className="field-block">
                    <label className="field-label">Location</label>
                    <input
                        type="text"
                        placeholder="Amritsar, Punjab"
                        value={location}
                        onChange={(e) => setlocation(e.target.value)}
                        className="field-input"
                    />
                </div>

                <div className="field-block">
                    <label className="field-label">Skills I can teach</label>
                    <div className="skill-row">
                        <input
                            type="text"
                            placeholder="e.g. React, Guitar, Spanish"
                            value={skillInputTeach}
                            onChange={(e) => setSkillInputTeach(e.target.value)}
                            className="field-input"
                        />
                        <button type="button" className="add-btn" onClick={handleAddTeachSkill}>ADD</button>
                    </div>
                    <div className="skills-display">
                        {skillListTeach.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                                <span onClick={() => handleRemoveTeachSkill(index)} className="remove-x"> ×</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="field-block">
                    <label className="field-label">Skills I want to learn</label>
                    <div className="skill-row">
                        <input
                            type="text"
                            placeholder="e.g. React, Guitar, Spanish"
                            value={skill_to_Learn}
                            onChange={(e) => setSkill_to_Learn(e.target.value)}
                            className="field-input"
                        />
                        <button type="button" className="add-btn" onClick={handleAddLearnSkill}>ADD</button>
                    </div>
                    <div className="skills-display">
                        {skill_List_learn.map((skill, index) => (
                            <span key={index} className="skill-tag skill-tag-learn">
                                {skill}
                                <span onClick={() => handleRemoveLearnSkill(index)} className="remove-x"> ×</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="field-row">
                    <div className="field-block">
                        <label className="field-label">Availability</label>
                        <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="field-input field-select"
                        >
                            <option value="">Select availability</option>
                            <option value="Weekends only">Weekends only</option>
                            <option value="Evenings">Evenings (after 6pm)</option>
                            <option value="Mornings">Mornings</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                    </div>

                    <div className="field-block">
                        <label className="field-label">Session type</label>
                        <select
                            value={sessionType}
                            onChange={(e) => setSessionType(e.target.value)}
                            className="field-input field-select"
                        >
                            <option value="">Select session type</option>
                            <option value="Free">Free skill swap only</option>
                            <option value="Paid">Paid sessions</option>
                            <option value="Both">Both — open to either</option>
                        </select>
                    </div>
                </div>
                {(sessionType === "Paid" || sessionType === "Both") && (
                    <div className="field-block">
                        <label className="field-label">Hourly rate (₹)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 500"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            className="field-input"
                        />
                    </div>
                )}

                {error && <p className="setup-msg setup-msg-error">{error}</p>}
                {success && <p className="setup-msg setup-msg-success">{success}</p>}

                <button type="submit" className="submit-btn" disabled={isloading}>
                    {isloading ? "Saving..." : "Save Profile & Continue →"}
                </button>
            </form>

            <div className="setup-ticker">
                <span className="ticker-label">SKILLS TRADED</span>
                <span className="ticker-item">+ UI/UX Design</span>
                <span className="ticker-item">+ Python Programming</span>
                <span className="ticker-item">+ Guitar Lessons</span>
                <span className="ticker-item">+ Digital Marketing</span>
                <span className="ticker-item">+ Hindi Speaking</span>
            </div>
        </div>
    );
}

export default SetupProfile;