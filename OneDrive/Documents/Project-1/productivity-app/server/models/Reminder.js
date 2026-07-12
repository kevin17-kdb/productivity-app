const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["required", "optional"],
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    triggerTime: {
      type: Date,
      required: true,
    },
    snoozeUntil: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dismissedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
