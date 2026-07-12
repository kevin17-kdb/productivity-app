const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    visibility: {
      type: String,
      enum: ["personal", "shared"],
      default: "personal",
    },
    headings: [String],
    entries: [
      {
        date: String,
        values: {
          type: Map,
          of: {
            checked: Boolean,
            note: String,
          },
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tracker", trackerSchema);
