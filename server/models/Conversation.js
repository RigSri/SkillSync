const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: true,
            unique: true,
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);