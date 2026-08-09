const mongoose = require("mongoose");

const User = require("../models/User");
const Review = require("../models/Review");
const Session = require("../models/Session");


const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully.",
            data: user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


// Update profile and availability
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            bio,
            city,
            timezone,
            profilePicture,
            availability,
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (city !== undefined) {
            user.city = city;
        }

        if (timezone !== undefined) {
            user.timezone = timezone;
        }

        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        if (availability !== undefined) {
            if (!Array.isArray(availability)) {
                return res.status(400).json({
                    success: false,
                    message: "Availability must be an array.",
                });
            }

            user.availability = availability;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


// Update only availability
const updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;

        if (!Array.isArray(availability)) {
            return res.status(400).json({
                success: false,
                message: "Availability must be an array.",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.availability = availability;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Availability updated successfully.",
            data: user.availability,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get credibility information for a user
const getUserCredibility = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(userId).select(
            "name email profilePicture"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Get reviews received by this user
        const reviews = await Review.find({
            reviewedUser: userId,
        }).select("rating");

        const reviewCount = reviews.length;

        const averageRating =
            reviewCount > 0
                ? Number(
                      (
                          reviews.reduce(
                              (sum, review) => sum + review.rating,
                              0
                          ) / reviewCount
                      ).toFixed(1)
                  )
                : 0;

        // Count completed sessions where this user was the teacher
        const completedTeachingSessions =
            await Session.countDocuments({
                teacher: userId,
                status: "completed",
            });

        // Count all completed sessions involving this user
        const completedSessions =
            await Session.countDocuments({
                $or: [
                    { teacher: userId },
                    { learner: userId },
                ],
                status: "completed",
            });

        // Badge rules
        const peerRated =
            reviewCount >= 1 && averageRating >= 4;

        const verifiedTeacher =
            completedTeachingSessions >= 3;

        return res.status(200).json({
            success: true,
            message: "User credibility fetched successfully.",
            data: {
                user,
                credibility: {
                    averageRating,
                    reviewCount,
                    completedSessions,
                    completedTeachingSessions,
                },
                badges: {
                    peerRated,
                    verifiedTeacher,
                },
            },
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
    getCurrentUser,
    updateProfile,
    updateAvailability,
    getUserCredibility,
};