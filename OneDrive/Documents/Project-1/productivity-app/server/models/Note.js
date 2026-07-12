const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: { type: String, enum: ["task", "reminder", "tracker"] },
        refId: mongoose.Schema.Types.ObjectId,
        label: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
