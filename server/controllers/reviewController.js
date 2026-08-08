const mongoose = require("mongoose");

const Review = require("../models/Review");
const Session = require("../models/Session");


// Create a review for a completed session
const createReview = async (req, res) => {
    try {
        const { sessionId, rating, comment } = req.body;

        // Validate session ID
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        // Find session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found.",
            });
        }

        // Only participants can review
        const isParticipant =
            session.teacher.toString() === req.user.id ||
            session.learner.toString() === req.user.id;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this session.",
            });
        }

        // Session must be completed
        if (session.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "A review can only be submitted for a completed session.",
            });
        }

        // Determine who is being reviewed
        const reviewedUser =
            session.teacher.toString() === req.user.id
                ? session.learner
                : session.teacher;

        // Check for existing review
        const existingReview = await Review.findOne({
            session: sessionId,
            reviewer: req.user.id,
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this session.",
            });
        }

        // Create review
        const review = await Review.create({
            session: sessionId,
            reviewer: req.user.id,
            reviewedUser,
            rating,
            comment: comment || "",
        });

        const populatedReview = await Review.findById(review._id)
            .populate(
                "reviewer",
                "name email profilePicture"
            )
            .populate(
                "reviewedUser",
                "name email profilePicture"
            )
            .populate(
                "session",
                "skill scheduledAt status"
            );

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            data: populatedReview,
        });
    } catch (error) {
        console.error(error);

        // MongoDB duplicate key
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this session.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get reviews received by a user
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const reviews = await Review.find({
            reviewedUser: userId,
        })
            .populate(
                "reviewer",
                "name profilePicture"
            )
            .populate(
                "session",
                "skill scheduledAt status"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "User reviews fetched successfully.",
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get reviews written by the logged-in user
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            reviewer: req.user.id,
        })
            .populate(
                "reviewedUser",
                "name email profilePicture"
            )
            .populate(
                "session",
                "skill scheduledAt status"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Your reviews fetched successfully.",
            count: reviews.length,
            data: reviews,
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
    createReview,
    getUserReviews,
    getMyReviews,
};