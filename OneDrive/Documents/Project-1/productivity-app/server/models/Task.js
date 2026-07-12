const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    workspace: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Group", 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["daily", "weekly", "monthly"], 
        required: true 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    
    // Scheduling Fields
    date: { 
        type: Date // Used to track specific day for daily tasks
    },
    hourSlot: { 
        type: String // e.g. "09:00" or optional for daily hourly rows
    },
    dayOfWeek: { 
        type: Number // 0 (Sunday) to 6 (Saturday) for weekly tasks
    },
    dayOfMonth: { 
        type: Number // 1 to 31 for monthly tasks
    },
    deadline: { 
        type: Date 
    },

    // Attachments
    attachments: [
        {
            fileName: String,
            url: String,
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }
    ],

    // Categories for AI metrics (Studying, Health, etc.)
    category: { 
        type: String, 
        enum: ["Studying", "Health", "Work", "Leisure", "General"], 
        default: "General" 
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },

    // Private notes: restricted at API level, accessible only to the owner
    privateNotes: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: String // Can store encrypted text
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
