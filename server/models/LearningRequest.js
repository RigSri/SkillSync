const mongoose = require("mongoose");

const learningRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
            maxlength: 300,
        },

        requestType: {
    type: String,
    enum: ["learn", "teach"],
    required: true,
},

        status: {
            type: String,
            enum: [
    "pending",
    "accepted",
    "rejected",
    "cancelled",
    "expired"
],
            default: "pending",
        },
        expiresAt: {
    type: Date,
    default: () =>
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
},
        skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
},
    },
    {
        timestamps: true,
    }
);

learningRequestSchema.index(
    {
        sender: 1,
        receiver: 1,
        skill: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: "pending",
        },
    }
);
learningRequestSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            status: "pending",
        },
    }
);
module.exports = mongoose.model(
    "LearningRequest",
    learningRequestSchema
);