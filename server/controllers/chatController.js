const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Match = require("../models/Match");


// Create or get conversation for an active match
const getOrCreateConversation = async (req, res) => {
    try {
        const { matchId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(matchId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid match ID.",
            });
        }

        const match = await Match.findOne({
            _id: matchId,
            status: "active",
        });

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Active match not found.",
            });
        }

        const isParticipant = match.users.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this match.",
            });
        }

        let conversation = await Conversation.findOne({
            match: matchId,
        })
            .populate(
                "participants",
                "name email profilePicture"
            )
            .populate("lastMessage");

        if (!conversation) {
            conversation = await Conversation.create({
                match: matchId,
                participants: match.users,
            });

            conversation = await Conversation.findById(
                conversation._id
            )
                .populate(
                    "participants",
                    "name email profilePicture"
                )
                .populate("lastMessage");
        }

        return res.status(200).json({
            success: true,
            message: "Conversation fetched successfully.",
            data: conversation,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Send a message
const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID.",
            });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty.",
            });
        }

        const conversation = await Conversation.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        const isParticipant = conversation.participants.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation.",
            });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user.id,
            text: text.trim(),
        });

        conversation.lastMessage = message._id;

        await conversation.save();

        const populatedMessage = await Message.findById(
            message._id
        ).populate(
            "sender",
            "name email profilePicture"
        );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: populatedMessage,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get messages in a conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID.",
            });
        }

        const conversation = await Conversation.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        const isParticipant = conversation.participants.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation.",
            });
        }

        const messages = await Message.find({
            conversation: conversationId,
        })
            .populate(
                "sender",
                "name email profilePicture"
            )
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully.",
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get conversations for logged-in user
const getMyConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id,
        })
            .populate(
                "participants",
                "name email profilePicture"
            )
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Conversations fetched successfully.",
            count: conversations.length,
            data: conversations,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


module.exports = {
    getOrCreateConversation,
    sendMessage,
    getMessages,
    getMyConversations,
};