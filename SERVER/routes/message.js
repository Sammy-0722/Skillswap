const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const Session = require("../models/session");
const authMiddleware = require("../middleware/auth");

// ---------- GET ALL CONVERSATIONS (chat inbox list) ----------
// Must come BEFORE the /:sessionId route below, otherwise Express
// would treat "conversations" as a sessionId.
router.get("/conversations/list", authMiddleware, async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await Message.aggregate([
            { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$sessionId",
                    lastMessage: { $first: "$text" },
                    lastMessageTime: { $first: "$createdAt" },
                    sender: { $first: "$sender" },
                    receiver: { $first: "$receiver" },
                },
            },
            {
                $addFields: {
                    otherUserId: {
                        $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "otherUserId",
                    foreignField: "_id",
                    as: "otherUser",
                },
            },
            { $unwind: "$otherUser" },
            { $sort: { lastMessageTime: -1 } },
            {
                $project: {
                    sessionId: "$_id",
                    lastMessage: 1,
                    lastMessageTime: 1,
                    otherUserName: "$otherUser.name",
                    _id: 0,
                },
            },
        ]);

        res.status(200).json({ conversations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

// ---------- DELETE AN ENTIRE CHAT ----------
router.delete("/:sessionId", authMiddleware, async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        const isParticipant =
            session.sender.toString() === req.user.id ||
            session.receiver.toString() === req.user.id;
        if (!isParticipant) {
            return res.status(403).json({ error: "Not authorized to delete this chat" });
        }

        await Message.deleteMany({ sessionId: req.params.sessionId });
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete chat" });
    }
});

// ---------- GET CHAT HISTORY FOR A SESSION ----------
router.get("/:sessionId", authMiddleware, async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        const isParticipant =
            session.sender.toString() === req.user.id ||
            session.receiver.toString() === req.user.id;
        if (!isParticipant) {
            return res.status(403).json({ error: "Not authorized to view this chat" });
        }

        const messages = await Message.find({ sessionId: req.params.sessionId })
            .sort({ createdAt: 1 })
            .populate("sender", "name");

        res.status(200).json({
            messages: messages.map((m) => ({
                id: m._id,
                text: m.text,
                senderId: m.sender._id,
                senderName: m.sender.name,
                createdAt: m.createdAt,
            })),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

module.exports = router;