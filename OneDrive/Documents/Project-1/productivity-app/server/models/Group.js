const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: {
                type: String,
                enum: ["Architect", "Planner", "Contributor", "Observer"],
                default: "Contributor"
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);