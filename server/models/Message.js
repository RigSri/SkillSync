const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000,
        },

        attachments: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 200,
                },

                url: {
                    type: String,
                    required: true,
                    trim: true,
                },

                type: {
                    type: String,
                    required: true,
                    enum: [
                        "pdf",
                        "doc",
                        "docx",
                        "png",
                        "jpg",
                        "jpeg",
                    ],
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

messageSchema.index({
    conversation: 1,
    createdAt: 1,
});

module.exports = mongoose.model("Message", messageSchema);