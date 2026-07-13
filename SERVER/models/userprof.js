const mongoose = require("mongoose");
const profileSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bio: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 500,
        required: true
    },
    location: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 100,
        required: true
    },
    skillsToLearn: {
        type: [{
            type: String,
            trim: true,
            maxlength: 50
        }],
        validate: {
            validator: (skills) => skills.length <= 20,
            message: "You can add at most 20 skills to learn."
        },
        default: []
    },

    skillsToTeach: {
        type: [{
            type: String,
            trim: true,
            maxlength: 50
        }],
        validate: {
            validator: (skills) => skills.length <= 20,
            message: "You can add at most 20 skills to teach."
        },
        default: []
    },

    availability: {
        type: String,
        
    },
    sessionType: {
        type: String
    },
     hourlyRate: {
        type: Number,
        min: 0,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    profilecomplete: {
        type: Boolean,
        default: false
    }


});
const UserProfie = mongoose.model("UserProfile", profileSchema)
module.exports = UserProfie;
