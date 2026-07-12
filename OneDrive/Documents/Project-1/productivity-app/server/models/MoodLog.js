const mongoose = require("mongoose");

const moodLogSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    score: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5 
    },
    reason: { 
        type: String 
    },
    aiResponse: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model("MoodLog", moodLogSchema);
