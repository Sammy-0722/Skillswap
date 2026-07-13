const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    skillToLearn: {
        type: String,
        trim: true,
        required: true
    },
    proposedDateTime: {
        type: Date,
        required: true
    },
    sessionType: {
        type: String,
        trim: true,
        enum: ["Free", "Paid", "Mentorship"],
        required: true
    },
    message: {
        type: String,
        trim: true,
        maxlength: 300
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending"
    },
   razorpayOrderId: { type: String },
razorpayPaymentId: { type: String },
    // NEW — tracks payment separately from confirmation status.
    // "not_required" for Free sessions, "pending" until paid, "paid" once done.
    paymentStatus: {
        type: String,
        enum: ["not_required", "pending", "paid"],
        default: "not_required"
    },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 300 },
        givenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }

}, { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;