const mongoose = require("mongoose");

const User = require("../models/User");
const Review = require("../models/Review");
const Session = require("../models/Session");
const Skill = require("../models/Skill");

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
// Get another user's public profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(userId).select(
            "name email bio city timezone profilePicture availability createdAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const skills = await Skill.find({
            user: userId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            data: {
                user,
                skills,
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
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
        }

        const searchQuery = q.trim();

        const users = await User.find({
    _id: {
        $ne: new mongoose.Types.ObjectId(req.user.id),
    },
            $or: [
                {
                    name: {
                        $regex: searchQuery,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: searchQuery,
                        $options: "i",
                    },
                },
                {
                    city: {
                        $regex: searchQuery,
                        $options: "i",
                    },
                },
            ],
        })
            .select(
                "name email city profilePicture"
            )
            .limit(8);

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to search users.",
        });
    }
};
const searchSkillPartners = async (req, res) => {
    try {
        const {
            q,
            mode = "learn",
            level,
            peerRated,
            verifiedTeacher,
        } = req.query;

        if (!q || !q.trim()) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
        }

        if (!["learn", "teach"].includes(mode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid search mode.",
            });
        }

        const skillType =
            mode === "learn" ? "teach" : "learn";

        const skillQuery = {
            user: { $ne: req.user.id },
            type: skillType,
            name: {
                $regex: q.trim(),
                $options: "i",
            },
        };

        if (
            ["Beginner", "Intermediate", "Advanced"].includes(
                level
            )
        ) {
            skillQuery.level = level;
        }

        const skills = await Skill.find(skillQuery)
            .populate(
                "user",
                "name email city profilePicture"
            )
            .sort({ createdAt: -1 })
            .limit(20);

        const results = [];

        for (const skill of skills) {
            if (!skill.user) continue;

            const reviews = await Review.find({
                reviewedUser: skill.user._id,
            }).select("rating");

            const reviewCount = reviews.length;

            const averageRating =
                reviewCount > 0
                    ? Number(
                          (
                              reviews.reduce(
                                  (sum, review) =>
                                      sum + review.rating,
                                  0
                              ) / reviewCount
                          ).toFixed(1)
                      )
                    : 0;

            const completedTeachingSessions =
                await Session.countDocuments({
                    teacher: skill.user._id,
                    status: "completed",
                });

            const isPeerRated =
                reviewCount >= 1 &&
                averageRating >= 4;

            const isVerifiedTeacher =
                completedTeachingSessions >= 3;

            if (
                peerRated === "true" &&
                !isPeerRated
            ) {
                continue;
            }

            if (
                verifiedTeacher === "true" &&
                !isVerifiedTeacher
            ) {
                continue;
            }

            results.push({
                user: skill.user,
                skill: {
                    _id: skill._id,
                    name: skill.name,
                    type: skill.type,
                    level: skill.level,
                    category: skill.category,
                },
                credibility: {
                    averageRating,
                    reviewCount,
                    completedTeachingSessions,
                },
                badges: {
                    peerRated: isPeerRated,
                    verifiedTeacher:
                        isVerifiedTeacher,
                },
            });
        }

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to search skill partners.",
        });
    }
};
module.exports = {
    getCurrentUser,
    updateProfile,
    updateAvailability,
    getUserCredibility,
    getUserProfile,
    searchUsers,
    searchSkillPartners,
};