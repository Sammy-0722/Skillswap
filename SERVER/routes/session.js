const express = require('express');
const router = express.Router();
const Session = require("../models/session.js");
const UserProfile = require("../models/userprof.js")
const authMiddleware = require("../middleware/auth.js");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// app.use(express.json());
router.post("/request", authMiddleware, async (req, res) => {
    try {
        const { receiverId, skillToLearn, proposedDateTime, sessionType, message, } = req.body;
        if (!receiverId || !skillToLearn || !sessionType || !proposedDateTime) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let amount = 0;
        if (sessionType === "Paid") {
            const receiverProfile = await UserProfile.findOne({ userId: receiverId });
            amount = receiverProfile?.hourlyRate || 0;
        }
        const session = new Session({
            sender: req.user.id,
            receiver: receiverId,
            skillToLearn,
            proposedDateTime,
            sessionType,
            message,
            amount: sessionType === "Paid" ? (amount || 0) : 0,
            status: "pending",
            paymentStatus: sessionType === "Paid" ? "pending" : "not_required",
        });
        await session.save();
        res.status(201).json({ session });
    } catch (err) {
        console.error(err);   // also fix: was "console.error(error)" — "error" doesn't exist, only "err" does
        res.status(500).json({ error: "Failed to create Session request" });
    }
});
router.put("/:id/confirm",authMiddleware,async(req,res)=>{
    try{
        const session = await Session.findById(req.params.id);
        if(!session){
            return res.status(404).json({error:"Session not found"});
        }
        if(session.receiver.toString()!=req.user.id){
            return res.status(403).json({error :"Not authorized to cofirm this session"});
        }
        session.status = "confirmed";
        await session.save();
        res.status(200).json({session})
    }catch(err){
        console.log(err);
        res.status(500).json({error :"failed to confirm session"});
    }
});
router.put("/:id/withdraw",authMiddleware,async(req,res)=>{
    try{
        const session = await Session.findById(req.params.id);
        if(!session){
            return res.status(404).json({error : "Session not found"});
        }
        if(session.sender.toString()!=req.user.id){
            return res.status(400).json({error:"Not Authorized to cancel session"});
        }
        session.status="cancelled";
        await session.save();
        res.status(200).json({session});
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Failed to withdraw session"});
    }
});
router.put("/:id/cancel",authMiddleware,async(req,res)=>{
    try{
        const session = await Session.findById(req.params.id);
        if(!session){
            return res.status(404).json({error:"Session not found"});
        }
        if(session.receiver.toString()!=req.user.id){
            return res.status(400).json({error:"Not Autorized to cancel session"});
        }
        session.status = "cancelled";
        await session.save();
        res.status(200).json({session});
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Failed to cancel session"});
    }
});
router.post("/:id/create-order", authMiddleware, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ error: "Session not found" });
        if (session.sender.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to pay for this session" });
        }
        if (session.sessionType !== "Paid") {
            return res.status(400).json({ error: "This session does not require payment" });
        }

        const amountInPaise = Math.round(session.amount * 100);
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `session_${session._id}`,
        });

        session.razorpayOrderId = order.id;
        await session.save();

        res.status(200).json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

router.post("/:id/verify-payment", authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ error: "Session not found" });

        if (session.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ error: "Order mismatch" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed" });
        }

        session.paymentStatus = "paid";
        session.razorpayPaymentId = razorpay_payment_id;
        await session.save();

        res.status(200).json({ message: "Payment verified", session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});
router.get('/upcoming',authMiddleware,async(req,res)=>{
 try{
     const sessions = await Session.find({
        $or:[{sender:req.user.id},{receiver:req.user.id}],
        status : {$in:['confirmed','pending']},
        proposedDateTime:{$gte:new Date()},
     })
     .sort({proposedDateTime : 1})
     .populate("sender","name email")
     .populate("receiver","name email");

     const formatted = sessions.map((s)=>{
        const isSender = s.sender._id.toString()===req.user.id;
        const otherUser = isSender?s.receiver:s.sender;
        return{
            id : s._id,
            skill:s.skillToLearn,
            name :otherUser.name,
            proposedDateTime:s.proposedDateTime,
            sessionType:s.sessionType,
            amount:s.amount,
            status:s.status,
            paymentStatus:s.paymentStatus,
            isSender,
        };

     });
     res.status(200).json({sessions:formatted});
 }catch(err){
    console.error(err);
    res.status(500).json({error:"Failed to fetch upcoming sessions"});
 }
});
router.get("/requests", authMiddleware, async (req, res) => {
    try {
        const [incoming, outgoing] = await Promise.all([
            Session.find({ receiver: req.user.id, status: "pending" })
                .sort({ createdAt: -1 })
                .populate("sender", "name email"),
            Session.find({ sender: req.user.id, status: "pending" })
                .sort({ createdAt: -1 })
                .populate("receiver", "name email"),
        ]);

        const formattedIncoming = incoming.map((s) => ({
            id: s._id,
            name: s.sender.name,
            skill: s.skillToLearn,
            proposedDateTime: s.proposedDateTime,
            sessionType: s.sessionType,
            amount: s.amount,
            message: s.message,
        }));

        const formattedOutgoing = outgoing.map((s) => ({
            id: s._id,
            name: s.receiver.name,
            skill: s.skillToLearn,
            proposedDateTime: s.proposedDateTime,
            sessionType: s.sessionType,
            amount: s.amount,
            message: s.message,
        }));

        res.status(200).json({ incoming: formattedIncoming, outgoing: formattedOutgoing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
});

module.exports = router;