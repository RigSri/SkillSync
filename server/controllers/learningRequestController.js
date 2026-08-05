const mongoose = require("mongoose");

const LearningRequest = require("../models/LearningRequest");
const User = require("../models/User");

const sendLearningRequest = async (req, res) => {
    try {
        const { receiverId, requestType, message } = req.body;

        // Validate receiver ID
        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID is required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver ID.",
            });
        }

        // Validate request type
        if (!requestType) {
            return res.status(400).json({
                success: false,
                message: "Request type is required.",
            });
        }

        if (!["learn", "teach"].includes(requestType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request type.",
            });
        }

        // Prevent sending to yourself
        if (receiverId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a learning request to yourself.",
            });
        }

        // Check receiver exists
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found.",
            });
        }

        // Prevent duplicate pending requests
        const existingRequest = await LearningRequest.findOne({
            sender: req.user.id,
            receiver: receiverId,
            status: "Pending",
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: "A pending request already exists.",
            });
        }

        // Create request
        const request = await LearningRequest.create({
            sender: req.user.id,
            receiver: receiverId,
            requestType,
            message,
        });

        // Populate sender & receiver details
        const populatedRequest = await LearningRequest.findById(request._id)
            .populate("sender", "name email")
            .populate("receiver", "name email");

        return res.status(201).json({
            success: true,
            message: "Learning request sent successfully.",
            data: populatedRequest,
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A pending request already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const getSentRequests = async (req, res) => {
    try {
        const requests = await LearningRequest.find({
    sender: req.user.id,
})
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const getReceivedRequests = async (req, res) => {
    try {
        const requests = await LearningRequest.find({
            receiver: req.user.id,
        })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const acceptLearningRequest = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID.",
            });
        }

        const request = await LearningRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        if (request.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "This request has already been processed.",
            });
        }

        request.status = "Accepted";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Learning request accepted.",
            data: request,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const rejectLearningRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID.",
            });
        }

        const request = await LearningRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        if (request.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "This request has already been processed.",
            });
        }

        request.status = "Rejected";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Learning request rejected.",
            data: request,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const cancelLearningRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID.",
            });
        }

        const request = await LearningRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        if (request.sender.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        if (request.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be cancelled.",
            });
        }

        request.status = "Cancelled";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Learning request cancelled.",
            data: request,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    sendLearningRequest,
    getSentRequests,
    getReceivedRequests,
    acceptLearningRequest,
    rejectLearningRequest,
    cancelLearningRequest,
};