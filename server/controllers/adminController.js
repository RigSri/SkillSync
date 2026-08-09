const mongoose = require("mongoose");

const User = require("../models/User");
const Report = require("../models/Report");
const Match = require("../models/Match");
const Session = require("../models/Session");
const Skill = require("../models/Skill");


// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select(
                "name email role isBlocked city timezone createdAt"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get all reports
const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate(
                "reporter",
                "name email profilePicture"
            )
            .populate(
                "reportedUser",
                "name email profilePicture isBlocked"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Reports fetched successfully.",
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};
// Get users who have been reported multiple times
const getFlaggedUsers = async (req, res) => {
    try {
        const flaggedUsers = await Report.aggregate([
            {
                $group: {
                    _id: "$reportedUser",
                    reportCount: {
                        $sum: 1,
                    },
                },
            },
            {
                $match: {
                    reportCount: {
                        $gte: 2,
                    },
                },
            },
            {
                $sort: {
                    reportCount: -1,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    isBlocked: "$user.isBlocked",
                    reportCount: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Flagged users fetched successfully.",
            count: flaggedUsers.length,
            data: flaggedUsers,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Resolve or dismiss a report
const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, adminNote } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID.",
            });
        }

        if (!["resolved", "dismissed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be resolved or dismissed.",
            });
        }

        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found.",
            });
        }

        report.status = status;

        if (adminNote !== undefined) {
            report.adminNote = adminNote;
        }

        await report.save();

        return res.status(200).json({
            success: true,
            message: `Report ${status} successfully.`,
            data: report,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Block a user
const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot block their own account.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.isBlocked = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User blocked successfully.",
            data: {
                userId: user._id,
                isBlocked: user.isBlocked,
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


// Unblock a user
const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.isBlocked = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully.",
            data: {
                userId: user._id,
                isBlocked: user.isBlocked,
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


// Basic analytics
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const totalMatches = await Match.countDocuments();

        const activeMatches = await Match.countDocuments({
            status: "active",
        });

        const completedSessions =
            await Session.countDocuments({
                status: "completed",
            });

        const pendingReports =
            await Report.countDocuments({
                status: "pending",
            });

        const totalSkills = await Skill.countDocuments();

        const topSkills = await Skill.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: 5,
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Analytics fetched successfully.",
            data: {
                totalUsers,
                totalMatches,
                activeMatches,
                completedSessions,
                pendingReports,
                totalSkills,
                topSkills,
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
    getUsers,
    getReports,
    getFlaggedUsers,
    updateReportStatus,
    blockUser,
    unblockUser,
    getAnalytics,
};