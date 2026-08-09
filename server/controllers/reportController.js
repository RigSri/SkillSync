const mongoose = require("mongoose");

const Report = require("../models/Report");
const User = require("../models/User");


// Create a report
const createReport = async (req, res) => {
    try {
        const {
            reportedUserId,
            reason,
            description,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reported user ID.",
            });
        }

        if (reportedUserId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot report yourself.",
            });
        }

        const reportedUser = await User.findById(
            reportedUserId
        );

        if (!reportedUser) {
            return res.status(404).json({
                success: false,
                message: "Reported user not found.",
            });
        }

        const existingReport = await Report.findOne({
            reporter: req.user.id,
            reportedUser: reportedUserId,
            status: "pending",
        });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                message: "You already have a pending report against this user.",
            });
        }

        const report = await Report.create({
            reporter: req.user.id,
            reportedUser: reportedUserId,
            reason,
            description: description || "",
        });

        const populatedReport = await Report.findById(
            report._id
        )
            .populate(
                "reporter",
                "name email profilePicture"
            )
            .populate(
                "reportedUser",
                "name email profilePicture"
            );

        return res.status(201).json({
            success: true,
            message: "Report submitted successfully.",
            data: populatedReport,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get reports submitted by logged-in user
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({
            reporter: req.user.id,
        })
            .populate(
                "reportedUser",
                "name email profilePicture"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Your reports fetched successfully.",
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


module.exports = {
    createReport,
    getMyReports,
};