const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["teach", "learn"],
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

   category: {
    type: String,
    trim: true,
    default: "General",
},

    proof: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate skills of the same type for a user
skillSchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model("Skill", skillSchema);