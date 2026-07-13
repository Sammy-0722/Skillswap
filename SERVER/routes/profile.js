const express = require('express')
const router = express.Router();
const UserProfile = require("../models/userprof");
const authMiddleware = require("../middleware/auth");
router.post("/setup", authMiddleware, async (req, res) => {
    try {
        const { bio, location, skillsToTeach, skillsToLearn,   availability, sessionType ,hourlyRate} = req.body;
        const isprofile = await UserProfile.findOne({ userId: req.user.id });
        if (isprofile) {
            return res.status(400).json({ error: "profile already exists" });
        }

        const newprofile = new UserProfile({
            userId: req.user.id,
            bio,
            location,
            skillsToTeach,
            skillsToLearn,
           availability,
            sessionType,
             hourlyRate: (sessionType === "Paid" || sessionType === "Both") ? (hourlyRate || 0) : 0,
            profilecomplete: true

        });
        await newprofile.save();
        res.status(201).json(newprofile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to complete profile" });
    }
});
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.id }).populate("userId", "name email");
        if (!profile) {
            return res.status(404).json({ error: " no id is found" });
        }
        res.status(200).json({profile})
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "no user" });
    }


});
router.get("/all", authMiddleware, async (req, res) => {
    try {
        const profiles = await UserProfile.find({ userId: { $ne: req.user.id } })
        .populate("userId", "name email");
     
        res.status(200).json({ profiles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch profiles" });
    }
});
router.get("/:userId",async(req,res)=>{
    try{
    const user = await UserProfile.findOne({ userId: req.params.userId });
    if(!user){
        return res.status(404).json({error: "usr is not found"});
    }
    res.status(200).json({user});
}catch(err){
    console.error(err);
    res.status(500).json({ error: "no user" });
}
});

router.put("/update",authMiddleware,async(req,res)=>{
    try{
    const {bio,location,skillsToLearn,skillsToTeach,availability,sessionType,hourlyRate}= req.body;
    const updateddata = await UserProfile.findOneAndUpdate(
        {userId:req.user.id},
        {bio,location,skillsToTeach,skillsToLearn,availability,sessionType,hourlyRate},
        {new:true}
    );
    if(!updateddata){
        return res.status(404).json({error: "Profile not found"});
    }
    res.status(200).json({updateddata});
}catch(err){
    console.error(err);
    res.status(500).json({error:"Failed to update profile"});
}
});
module.exports = router;