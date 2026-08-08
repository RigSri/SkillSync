const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
    {
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        skills: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Skill",
            },
        ],

        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Match", matchSchema);