const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    content: {
      type: String,
      required: true
    },

    category: {
      type: String,
      default: "General"
    },

    company: {
      type: String,
      default: "General"
    },

    author: {
      type: String,
      default: "Anonymous"
    },

    // FIX: Updated comments array to properly support userName and text strings
    comments: [
      {
        userName: {
          type: String,
          default: "Anonymous"
        },

        text: {
          type: String,
          required: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);