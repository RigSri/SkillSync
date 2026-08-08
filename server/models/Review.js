const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },

        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reviewedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.index(
    {
        session: 1,
        reviewer: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Review", reviewSchema);