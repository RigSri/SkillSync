const mongoose = require("mongoose");

const LearningRequest = require("../models/LearningRequest");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Match = require("../models/Match");
const Notification = require("../models/Notification");
const populateRequest = (query) => {
    return query
        .populate("sender", "name email profilePicture bio city timezone")
        .populate("receiver", "name email profilePicture bio city timezone")
        .populate("skill", "name type level category proof");
};

// Send a learning request
const sendLearningRequest = async (req, res) => {
    try {
        const {
            receiverId,
            skillId,
            requestType,
            message,
        } = req.body;

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

        // Validate skill ID
        if (!skillId) {
            return res.status(400).json({
                success: false,
                message: "Skill ID is required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID.",
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

        // Check skill exists
        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        // Skill must belong to the receiver
        if (skill.user.toString() !== receiverId) {
            return res.status(400).json({
                success: false,
                message: "This skill does not belong to the selected user.",
            });
        }

        // Validate that the skill direction makes sense
        if (requestType === "learn" && skill.type !== "teach") {
            return res.status(400).json({
                success: false,
                message:
                    "You can only send a learn request for a skill the user teaches.",
            });
        }

        if (requestType === "teach" && skill.type !== "learn") {
            return res.status(400).json({
                success: false,
                message:
                    "You can only send a teach request for a skill the user wants to learn.",
            });
        }

        // Only one pending request for the same
        // sender + receiver + skill combination
        const existingRequest = await LearningRequest.findOne({
            sender: req.user.id,
            receiver: receiverId,
            skill: skillId,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message:
                    "A pending request for this skill already exists.",
            });
        }

        // Create request
        const request = await LearningRequest.create({
            sender: req.user.id,
            receiver: receiverId,
            skill: skillId,
            requestType,
            message,
        });
        const sender = await User.findById(req.user.id).select(
    "name"
);

await Notification.create({
    recipient: receiverId,
    sender: req.user.id,
    type: "learning_request",
    title: "New learning request",
    message:
        requestType === "learn"
            ? `${sender.name} wants to learn ${skill.name} from you.`
            : `${sender.name} wants to teach you ${skill.name}.`,
    link: "/requests",
    relatedId: request._id,
});
        // Return populated request
        const populatedRequest = await populateRequest(
            LearningRequest.findById(request._id)
        );

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
                message:
                    "A pending request for this skill already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


// Get requests sent by current user
const getSentRequests = async (req, res) => {
    try {
        const requests = await populateRequest(
            LearningRequest.find({
                sender: req.user.id,
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Sent requests fetched successfully.",
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


// Get requests received by current user
const getReceivedRequests = async (req, res) => {
    try {
        const requests = await populateRequest(
            LearningRequest.find({
                receiver: req.user.id,
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Received requests fetched successfully.",
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


// Accept learning request
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

        // Only receiver can accept
        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the receiver can accept this request.",
            });
        }

        // Only pending requests can be accepted
        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This request has already been processed.",
            });
        }

        // Accept the request
        request.status = "accepted";
        await request.save();

        // Find an existing active match between these two users
        let match = await Match.findOne({
            users: {
                $all: [request.sender, request.receiver],
                $size: 2,
            },
            status: "active",
        });

        // If no match exists, create one
        if (!match) {
            match = await Match.create({
                users: [request.sender, request.receiver],
                skills: [request.skill],
                status: "active",
            });
        } else {
            // If match already exists, add this skill if it isn't already there
            const skillAlreadyExists = match.skills.some(
                (skillId) =>
                    skillId.toString() === request.skill.toString()
            );

            if (!skillAlreadyExists) {
                match.skills.push(request.skill);
                await match.save();
            }
        }

        // Populate both request and match
        const populatedRequest = await populateRequest(
            LearningRequest.findById(request._id)
        );

        const populatedMatch = await Match.findById(match._id)
            .populate(
                "users",
                "name email profilePicture bio city timezone"
            )
            .populate(
                "skills",
                "name type level category proof"
            );

        return res.status(200).json({
            success: true,
            message: "Learning request accepted and match created.",
            data: {
                request: populatedRequest,
                match: populatedMatch,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// Reject learning request
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

        // Only receiver can reject
        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the receiver can reject this request.",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This request has already been processed.",
            });
        }

        request.status = "rejected";

        await request.save();

        const populatedRequest = await populateRequest(
            LearningRequest.findById(request._id)
        );

        return res.status(200).json({
            success: true,
            message: "Learning request rejected.",
            data: populatedRequest,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


// Cancel learning request
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

        // Only sender can cancel
        if (request.sender.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the sender can cancel this request.",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be cancelled.",
            });
        }

        request.status = "cancelled";

        await request.save();

        const populatedRequest = await populateRequest(
            LearningRequest.findById(request._id)
        );

        return res.status(200).json({
            success: true,
            message: "Learning request cancelled.",
            data: populatedRequest,
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