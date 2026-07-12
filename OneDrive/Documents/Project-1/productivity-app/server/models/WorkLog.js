const mongoose = require("mongoose");

const workLogSchema = new mongoose.Schema(
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
    date: {
      type: String,
      required: true,
    },
    entries: [
      {
        content: { type: String, required: true },
        taggedTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reflection: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workLogSchema.index({ workspace: 1, user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WorkLog", workLogSchema);
