const mongoose = require("mongoose");

const LearningRequest = require("../models/LearningRequest");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Match = require("../models/Match");
const Notification = require("../models/Notification");
const expireOldRequests = async () => {
    await LearningRequest.updateMany(
        {
            status: "pending",
            expiresAt: {
                $lte: new Date(),
            },
        },
        {
            $set: {
                status: "expired",
            },
        }
    );
};

const populateRequest = (query) => {
    return query
        .populate(
            "sender",
            "name email profilePicture bio city timezone"
        )
        .populate(
            "receiver",
            "name email profilePicture bio city timezone"
        )
        .populate(
            "skill",
            "name type level category proof"
        );
};

// Send a learning/teaching request
const sendLearningRequest = async (req, res) => {
    try {
        const {
            receiverId,
            skillId,
            requestType,
            message,
        } = req.body;

        // Validate receiver
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

        // Validate skill
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
        if (!["learn", "teach"].includes(requestType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request type.",
            });
        }

        // Prevent self request
        if (receiverId === req.user.id) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot send a learning request to yourself.",
            });
        }

        // Receiver must exist
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found.",
            });
        }

        // Admins cannot participate in normal matching
        if (receiver.role === "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Learning requests cannot be sent to admin accounts.",
            });
        }

        // Skill must exist
        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        // Skill must belong to receiver
        if (skill.user.toString() !== receiverId) {
            return res.status(400).json({
                success: false,
                message:
                    "This skill does not belong to the selected user.",
            });
        }

        // Validate direction
        if (
            requestType === "learn" &&
            skill.type !== "teach"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You can only send a learn request for a skill the user teaches.",
            });
        }

        if (
            requestType === "teach" &&
            skill.type !== "learn"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You can only send a teach request for a skill the user wants to learn.",
            });
        }

        // Check for an existing pending request in either direction
const pendingRequest = await LearningRequest.findOne({
    skill: skillId,
    status: "pending",
    $or: [
        {
            sender: req.user.id,
            receiver: receiverId,
        },
        {
            sender: receiverId,
            receiver: req.user.id,
        },
    ],
});

if (pendingRequest) {
    return res.status(409).json({
        success: false,
        message:
            "A pending request already exists for this skill between these users.",
    });
}



        // Check for an existing active learning relationship
        const existingMatch = await Match.findOne({
            users: {
                $all: [
                    req.user.id,
                    receiverId,
                ],
                $size: 2,
            },
            skills: skillId,
            status: "active",
        });

        if (existingMatch) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have an active learning relationship for this skill.",
            });
        }

        // Create request
        const request =
            await LearningRequest.create({
                sender: req.user.id,
                receiver: receiverId,
                skill: skillId,
                requestType,
                message: message || "",
            });

        // Get sender name
        const sender = await User.findById(
            req.user.id
        ).select("name");

        // Notify receiver
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

        const populatedRequest =
            await populateRequest(
                LearningRequest.findById(
                    request._id
                )
            );

        return res.status(201).json({
            success: true,
            message:
                "Learning request sent successfully.",
            data: populatedRequest,
        });
    } catch (error) {
        console.error(
            "SEND LEARNING REQUEST ERROR:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A pending request already exists for this skill between these users.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};

// Get requests sent by current user
const getSentRequests = async (req, res) => {
    try {
        await expireOldRequests();
        const requests =
            await populateRequest(
                LearningRequest.find({
                    sender: req.user.id,
                }).sort({ createdAt: -1 })
            );

        return res.status(200).json({
            success: true,
            message:
                "Sent requests fetched successfully.",
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
        await expireOldRequests();
        const requests =
            await populateRequest(
                LearningRequest.find({
                    receiver: req.user.id,
                }).sort({ createdAt: -1 })
            );

        return res.status(200).json({
            success: true,
            message:
                "Received requests fetched successfully.",
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

        const request =
            await LearningRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        if (
            request.receiver.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the receiver can accept this request.",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "This request has already been processed.",
            });
        }

        const receiver =
            await User.findById(
                request.receiver
            ).select("name");

        const skill =
            await Skill.findById(
                request.skill
            ).select("name");

        request.status = "accepted";
        await request.save();

        // Find existing active match
        let match = await Match.findOne({
            users: {
                $all: [
                    request.sender,
                    request.receiver,
                ],
                $size: 2,
            },
            status: "active",
        });

        // Create match if none exists
        if (!match) {
            match = await Match.create({
                users: [
                    request.sender,
                    request.receiver,
                ],
                skills: [request.skill],
                status: "active",
            });
        } else {
            const skillAlreadyExists =
                match.skills.some(
                    (skillId) =>
                        skillId.toString() ===
                        request.skill.toString()
                );

            if (!skillAlreadyExists) {
                match.skills.push(
                    request.skill
                );

                await match.save();
            }
        }

        // Notify the person who sent the request
        await Notification.create({
    recipient: request.sender,
    sender: request.receiver,
    type: "request_accepted",

    title:
        request.requestType === "teach"
            ? "Teaching request accepted"
            : "Learning request accepted",

    message:
        request.requestType === "teach"
            ? `${receiver.name} accepted your request to teach ${skill.name}.`
            : `${receiver.name} accepted your request to learn ${skill.name}.`,

    link: "/requests",
    relatedId: request._id,
});

        const populatedRequest =
            await populateRequest(
                LearningRequest.findById(
                    request._id
                )
            );

        const populatedMatch =
            await Match.findById(match._id)
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
            message:
                "Learning request accepted and match created.",
            data: {
                request: populatedRequest,
                match: populatedMatch,
            },
        });
    } catch (error) {
        console.error(
            "ACCEPT LEARNING REQUEST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
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

        const request =
            await LearningRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        if (
            request.receiver.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the receiver can reject this request.",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "This request has already been processed.",
            });
        }

        const receiver =
            await User.findById(
                request.receiver
            ).select("name");

        const skill =
            await Skill.findById(
                request.skill
            ).select("name");

        request.status = "rejected";
        await request.save();

        await Notification.create({
    recipient: request.sender,
    sender: request.receiver,
    type: "request_rejected",

    title:
        request.requestType === "teach"
            ? "Teaching request declined"
            : "Learning request declined",

    message:
        request.requestType === "teach"
            ? `${receiver.name} declined your request to teach ${skill.name}.`
            : `${receiver.name} declined your request to learn ${skill.name}.`,

    link: "/requests",
    relatedId: request._id,
});

        const populatedRequest =
            await populateRequest(
                LearningRequest.findById(
                    request._id
                )
            );

        return res.status(200).json({
            success: true,
            message:
                "Learning request rejected.",
            data: populatedRequest,
        });
    } catch (error) {
        console.error(
            "REJECT LEARNING REQUEST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
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

        const request =
            await LearningRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found.",
            });
        }

        if (
            request.sender.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the sender can cancel this request.",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending requests can be cancelled.",
            });
        }

        request.status = "cancelled";
        await request.save();

        const populatedRequest =
            await populateRequest(
                LearningRequest.findById(
                    request._id
                )
            );

        return res.status(200).json({
            success: true,
            message:
                "Learning request cancelled.",
            data: populatedRequest,
        });
    } catch (error) {
        console.error(
            "CANCEL LEARNING REQUEST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
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