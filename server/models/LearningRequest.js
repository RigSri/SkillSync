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
                "Pending",
                "Accepted",
                "Rejected",
                "Cancelled",
            ],
            default: "Pending",
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
        status: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "LearningRequest",
    learningRequestSchema
);