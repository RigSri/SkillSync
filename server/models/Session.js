const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: true,
        },

        skill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Skill",
            required: true,
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        scheduledAt: {
            type: Date,
            required: true,
        },

        duration: {
            type: Number,
            default: 60,
        },

        meetingLink: {
            type: String,
            default: "",
        },

        notes: {
    type: String,
    default: "",
    maxlength: 2000,
},

resources: [
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
    },
],

progress: {
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    milestones: [
        {
            title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 200,
            },

            completed: {
                type: Boolean,
                default: false,
            },
        },
    ],
},

        status: {
            type: String,
            enum: [
                "scheduled",
                "completed",
                "cancelled",
            ],
            default: "scheduled",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Session", sessionSchema);