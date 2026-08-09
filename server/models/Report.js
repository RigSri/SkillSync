const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reason: {
            type: String,
            enum: [
                "harassment",
                "spam",
                "fake_profile",
                "inappropriate_content",
                "scam",
                "other",
            ],
            required: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: ["pending", "resolved", "dismissed"],
            default: "pending",
        },

        adminNote: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

reportSchema.index({
    reporter: 1,
    reportedUser: 1,
    status: 1,
});

module.exports = mongoose.model("Report", reportSchema);