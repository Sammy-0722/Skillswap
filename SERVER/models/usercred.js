const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name must be at most 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"]
    },
   password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"]
}

}, { timestamps: true }); 

const User = mongoose.model("User", userSchema);
module.exports = User;