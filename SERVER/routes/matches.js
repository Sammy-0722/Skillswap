const express = require("express");
const router = express.Router();
const UserProfile = require("../models/userprof");
const authMiddleware = require("../middleware/auth");
const { getAIMatchReason } = require("../utils/aiSuggest");

router.get("/", authMiddleware, async (req, res) => {
    try {
        // Step 1 — get YOUR profile
        const myProfile = await UserProfile.findOne({ userId: req.user.id })
            .populate("userId", "name email");

        if (!myProfile) {
            return res.status(404).json({ error: "Complete your profile first" });
        }

        // Step 2 — get ALL other profiles (not yours)
        const allProfiles = await UserProfile.find({ userId: { $ne: req.user.id } })
            .populate("userId", "name email");

        // Step 3 — filter by skill overlap
        // find people whose skillsToTeach matches YOUR skillsToLearn
        const matched = allProfiles.filter(profile =>
            profile.skillsToTeach.some(skill =>
                myProfile.skillsToLearn.includes(skill)
            )
        );

        // Step 4 — for each match, ask Gemini WHY they are a good match
         const topMatches = matched.slice(0, 6);
        const matchesWithReasons = await Promise.all(
            matched.map(async (profile) => {
                // prepare data for Gemini
                const currentUser = {
                    teaches: myProfile.skillsToTeach,
                    wants: myProfile.skillsToLearn,
                };
                const matchUser = {
                    name: profile.userId?.name || "Someone",
                    teaches: profile.skillsToTeach,
                    wants: profile.skillsToLearn,
                };

                // call Gemini — if it fails, fallback reason is used
                const aiReason = await getAIMatchReason(currentUser, matchUser);

                // fallback reason if Gemini fails or returns null
                const fallbackReason = `${matchUser.name} teaches ${profile.skillsToTeach.join(", ")} and wants to learn ${profile.skillsToLearn.join(", ")} — a great swap for you!`;

                return {
                    userId: profile.userId?._id,
                    name: profile.userId?.name,
                    location: profile.location,
                    skillsToTeach: profile.skillsToTeach,
                    skillsToLearn: profile.skillsToLearn,
                    sessionType: profile.sessionType,
                    availability: profile.availbility,
                    rating: profile.rating,
                    hourlyRate: profile.hourlyRate,
                    aiReason: aiReason || fallbackReason,
                };
            })
        );

        // Step 5 — return top 6 matches
        res.status(200).json({ matches: matchesWithReasons });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

module.exports = router;