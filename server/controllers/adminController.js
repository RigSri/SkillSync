const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const getAdminHealth = async (req, res) => {
    try {
        const database =
            mongoose.connection.readyState === 1
                ? "Connected"
                : "Disconnected";

        const uptimeSeconds = process.uptime();

        const hours = Math.floor(
            uptimeSeconds / 3600
        );

        const minutes = Math.floor(
            (uptimeSeconds % 3600) / 60
        );

        const seconds = Math.floor(
            uptimeSeconds % 60
        );

        let uptime = "";

        if (hours > 0) {
            uptime += `${hours}h `;
        }

        if (minutes > 0 || hours > 0) {
            uptime += `${minutes}m `;
        }

        uptime += `${seconds}s`;

        const memoryUsage =
            process.memoryUsage().rss /
            (1024 * 1024);

        return res.status(200).json({
            success: true,
            data: {
                backend: "Healthy",
                database,
                uptime,
                memory: `${memoryUsage.toFixed(0)} MB`,
                checkedAt: new Date(),
            },
        });
    } catch (error) {
        console.error(
            "Admin health check error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to check system health.",
        });
    }
};
const User = require("../models/User");
const Report = require("../models/Report");
const Match = require("../models/Match");
const Session = require("../models/Session");
const Skill = require("../models/Skill");
const LearningRequest = require("../models/LearningRequest");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");


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
// Reset database and generate demo data
const resetDemoData = async (req, res) => {
    try {
        // Safety check
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required.",
            });
        }

        /*
         * --------------------------------------------------
         * 1. Remove application data
         * --------------------------------------------------
         */

        await Message.deleteMany({});
        await Conversation.deleteMany({});
        await Review.deleteMany({});
        await Session.deleteMany({});
        await Notification.deleteMany({});
        await LearningRequest.deleteMany({});
        await Match.deleteMany({});
        await Skill.deleteMany({});
        await Report.deleteMany({});

        /*
         * --------------------------------------------------
         * 2. Remove all normal users
         * --------------------------------------------------
         *
         * Keep every admin account.
         */

        await User.deleteMany({
            role: {
                $ne: "admin",
            },
        });

        /*
         * --------------------------------------------------
         * 3. Demo users
         * --------------------------------------------------
         */

        const demoPassword = await bcrypt.hash(
            "SkillSync123",
            10
        );

        const demoUsers = [
            {
                name: "Aarav Sharma",
                email: "aarav@skillsync.demo",
                city: "Bengaluru",
                timezone: "Asia/Kolkata",
                bio: "Computer science student interested in web development and DevOps.",
            },
            {
                name: "Ananya Iyer",
                email: "ananya@skillsync.demo",
                city: "Chennai",
                timezone: "Asia/Kolkata",
                bio: "Frontend developer who enjoys building clean and accessible interfaces.",
            },
            {
                name: "Rohan Mehta",
                email: "rohan@skillsync.demo",
                city: "Mumbai",
                timezone: "Asia/Kolkata",
                bio: "Backend developer interested in Node.js, databases and system design.",
            },
            {
                name: "Priya Nair",
                email: "priya@skillsync.demo",
                city: "Kochi",
                timezone: "Asia/Kolkata",
                bio: "Machine learning enthusiast exploring Python and practical ML projects.",
            },
            {
                name: "Arjun Verma",
                email: "arjun@skillsync.demo",
                city: "Delhi",
                timezone: "Asia/Kolkata",
                bio: "Java programmer preparing for DSA and competitive programming.",
            },
            {
                name: "Kavya Rao",
                email: "kavya@skillsync.demo",
                city: "Hyderabad",
                timezone: "Asia/Kolkata",
                bio: "UI/UX enthusiast interested in Figma, design systems and frontend development.",
            },
            {
                name: "Aditya Kulkarni",
                email: "aditya@skillsync.demo",
                city: "Pune",
                timezone: "Asia/Kolkata",
                bio: "DevOps learner working with Docker, Git and cloud technologies.",
            },
            {
                name: "Neha Kapoor",
                email: "neha@skillsync.demo",
                city: "Lucknow",
                timezone: "Asia/Kolkata",
                bio: "Data enthusiast learning Python, SQL and machine learning.",
            },
            {
                name: "Vikram Singh",
                email: "vikram@skillsync.demo",
                city: "Jaipur",
                timezone: "Asia/Kolkata",
                bio: "Software developer interested in C++, algorithms and system architecture.",
            },
            {
                name: "Ishita Desai",
                email: "ishita@skillsync.demo",
                city: "Ahmedabad",
                timezone: "Asia/Kolkata",
                bio: "Full-stack learner interested in MongoDB, Node.js and React.",
            },
        ];

        const users = await User.insertMany(
            demoUsers.map((user) => ({
                ...user,
                password: demoPassword,
                role: "user",
                isBlocked: false,
                availability: [
                    {
                        day: "Monday",
                        startTime: "18:00",
                        endTime: "21:00",
                    },
                    {
                        day: "Wednesday",
                        startTime: "18:00",
                        endTime: "21:00",
                    },
                    {
                        day: "Saturday",
                        startTime: "10:00",
                        endTime: "14:00",
                    },
                ],
            }))
        );

        /*
         * --------------------------------------------------
         * 4. Skills
         * --------------------------------------------------
         */

        const [
            aarav,
            ananya,
            rohan,
            priya,
            arjun,
            kavya,
            aditya,
            neha,
            vikram,
            ishita,
        ] = users;

        const skills = await Skill.insertMany([
            // Aarav
            {
                user: aarav._id,
                name: "react",
                type: "teach",
                level: "Advanced",
                category: "Programming",
            },
            {
                user: aarav._id,
                name: "docker",
                type: "learn",
                level: "Beginner",
                category: "DevOps",
            },

            // Ananya
            {
                user: ananya._id,
                name: "docker",
                type: "teach",
                level: "Intermediate",
                category: "DevOps",
            },
            {
                user: ananya._id,
                name: "react",
                type: "learn",
                level: "Intermediate",
                category: "Programming",
            },
            {
                user: ananya._id,
                name: "ui design",
                type: "teach",
                level: "Advanced",
                category: "Design",
            },

            // Rohan
            {
                user: rohan._id,
                name: "node",
                type: "teach",
                level: "Advanced",
                category: "Programming",
            },
            {
                user: rohan._id,
                name: "system design",
                type: "teach",
                level: "Intermediate",
                category: "Programming",
            },
            {
                user: rohan._id,
                name: "react",
                type: "learn",
                level: "Beginner",
                category: "Programming",
            },

            // Priya
            {
                user: priya._id,
                name: "python",
                type: "teach",
                level: "Advanced",
                category: "Programming",
            },
            {
                user: priya._id,
                name: "machine learning",
                type: "teach",
                level: "Advanced",
                category: "AI/ML",
            },
            {
                user: priya._id,
                name: "java",
                type: "learn",
                level: "Beginner",
                category: "Programming",
            },

            // Arjun
            {
                user: arjun._id,
                name: "java",
                type: "teach",
                level: "Advanced",
                category: "Programming",
            },
            {
                user: arjun._id,
                name: "dsa",
                type: "teach",
                level: "Advanced",
                category: "Algorithms",
            },
            {
                user: arjun._id,
                name: "system design",
                type: "learn",
                level: "Intermediate",
                category: "Programming",
            },

            // Kavya
            {
                user: kavya._id,
                name: "ui design",
                type: "teach",
                level: "Advanced",
                category: "Design",
            },
            {
                user: kavya._id,
                name: "figma",
                type: "teach",
                level: "Intermediate",
                category: "Design",
            },
            {
                user: kavya._id,
                name: "react",
                type: "learn",
                level: "Beginner",
                category: "Programming",
            },

            // Aditya
            {
                user: aditya._id,
                name: "docker",
                type: "teach",
                level: "Advanced",
                category: "DevOps",
            },
            {
                user: aditya._id,
                name: "git",
                type: "teach",
                level: "Intermediate",
                category: "DevOps",
            },
            {
                user: aditya._id,
                name: "node",
                type: "learn",
                level: "Intermediate",
                category: "Programming",
            },

            // Neha
            {
                user: neha._id,
                name: "python",
                type: "teach",
                level: "Intermediate",
                category: "Programming",
            },
            {
                user: neha._id,
                name: "sql",
                type: "teach",
                level: "Advanced",
                category: "Database",
            },
            {
                user: neha._id,
                name: "machine learning",
                type: "learn",
                level: "Beginner",
                category: "AI/ML",
            },

            // Vikram
            {
                user: vikram._id,
                name: "dsa",
                type: "teach",
                level: "Advanced",
                category: "Algorithms",
            },
            {
                user: vikram._id,
                name: "c++",
                type: "teach",
                level: "Advanced",
                category: "Programming",
            },
            {
                user: vikram._id,
                name: "system design",
                type: "learn",
                level: "Beginner",
                category: "Programming",
            },

            // Ishita
            {
                user: ishita._id,
                name: "mongodb",
                type: "teach",
                level: "Intermediate",
                category: "Database",
            },
            {
                user: ishita._id,
                name: "node",
                type: "teach",
                level: "Intermediate",
                category: "Programming",
            },
            {
                user: ishita._id,
                name: "docker",
                type: "learn",
                level: "Beginner",
                category: "DevOps",
            },
        ]);

        const skillBy = (userId, name, type) =>
            skills.find(
                (skill) =>
                    skill.user.toString() ===
                        userId.toString() &&
                    skill.name === name &&
                    skill.type === type
            );

        /*
         * --------------------------------------------------
         * 5. Demo matches
         * --------------------------------------------------
         */

        const aaravReact = skillBy(
            aarav._id,
            "react",
            "teach"
        );

        const ananyaDocker = skillBy(
            ananya._id,
            "docker",
            "teach"
        );

        const rohanNode = skillBy(
            rohan._id,
            "node",
            "teach"
        );

        const priyaPython = skillBy(
            priya._id,
            "python",
            "teach"
        );

        const arjunJava = skillBy(
            arjun._id,
            "java",
            "teach"
        );

        const kavyaUi = skillBy(
            kavya._id,
            "ui design",
            "teach"
        );

        const matches = await Match.insertMany([
            {
                users: [aarav._id, ananya._id],
                skills: [
                    aaravReact._id,
                    ananyaDocker._id,
                ],
                status: "active",
            },
            {
                users: [rohan._id, aditya._id],
                skills: [
                    rohanNode._id,
                    skillBy(
                        aditya._id,
                        "docker",
                        "teach"
                    )._id,
                ],
                status: "active",
            },
            {
                users: [priya._id, arjun._id],
                skills: [
                    priyaPython._id,
                    arjunJava._id,
                ],
                status: "active",
            },
            {
                users: [kavya._id, ishita._id],
                skills: [
                    kavyaUi._id,
                    skillBy(
                        ishita._id,
                        "node",
                        "teach"
                    )._id,
                ],
                status: "active",
            },
        ]);

        /*
         * --------------------------------------------------
         * 6. Completed sessions
         * --------------------------------------------------
         */

        const completedSessionData = [
            {
                match: matches[0],
                skill: aaravReact,
                teacher: aarav._id,
                learner: ananya._id,
            },
            {
                match: matches[0],
                skill: aaravReact,
                teacher: aarav._id,
                learner: ananya._id,
            },
            {
                match: matches[1],
                skill: rohanNode,
                teacher: rohan._id,
                learner: aditya._id,
            },
            {
                match: matches[2],
                skill: priyaPython,
                teacher: priya._id,
                learner: arjun._id,
            },
            {
                match: matches[3],
                skill: kavyaUi,
                teacher: kavya._id,
                learner: ishita._id,
            },
        ];

        const sessions =
            await Session.insertMany(
                completedSessionData.map(
                    (item, index) => ({
                        match: item.match._id,
                        skill: item.skill._id,
                        teacher: item.teacher,
                        learner: item.learner,
                        scheduledAt: new Date(
                            Date.now() -
                                (index + 1) *
                                    7 *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                        ),
                        duration: 60,
                        meetingLink: "",
                        notes:
                            "Demo completed learning session.",
                        resources: [],
                        progress: {
                            percentage: 100,
                            milestones: [
                                {
                                    title:
                                        "Session completed",
                                    completed: true,
                                },
                            ],
                        },
                        status: "completed",
                    })
                )
            );

        /*
         * --------------------------------------------------
         * 7. Reviews
         * --------------------------------------------------
         */

        await Review.insertMany([
            {
                session: sessions[0]._id,
                reviewer: ananya._id,
                reviewedUser: aarav._id,
                rating: 5,
                comment:
                    "Very clear explanation and helpful examples.",
            },
            {
                session: sessions[1]._id,
                reviewer: ananya._id,
                reviewedUser: aarav._id,
                rating: 5,
                comment:
                    "Great teaching session.",
            },
            {
                session: sessions[2]._id,
                reviewer: aditya._id,
                reviewedUser: rohan._id,
                rating: 4,
                comment:
                    "Good practical explanation.",
            },
            {
                session: sessions[3]._id,
                reviewer: arjun._id,
                reviewedUser: priya._id,
                rating: 5,
                comment:
                    "Excellent Python session.",
            },
            {
                session: sessions[4]._id,
                reviewer: ishita._id,
                reviewedUser: kavya._id,
                rating: 5,
                comment:
                    "Very useful UI design guidance.",
            },
        ]);

        /*
         * --------------------------------------------------
         * 8. Demo learning requests
         * --------------------------------------------------
         */

        await LearningRequest.insertMany([
            {
                sender: rohan._id,
                receiver: aarav._id,
                skill: aaravReact._id,
                requestType: "learn",
                message:
                    "I would like to learn React from you.",
                status: "pending",
            },
            {
                sender: neha._id,
                receiver: priya._id,
                skill: priyaPython._id,
                requestType: "learn",
                message:
                    "I would like to improve my Python skills.",
                status: "pending",
            },
            {
                sender: kavya._id,
                receiver: ananya._id,
                skill: ananyaDocker._id,
                requestType: "learn",
                message:
                    "I want to learn Docker from you.",
                status: "pending",
            },
            {
                sender: ishita._id,
                receiver: aarav._id,
                skill: aaravReact._id,
                requestType: "learn",
                message:
                    "Would love to learn React.",
                status: "rejected",
            },
        ]);

        /*
         * --------------------------------------------------
         * 9. Demo notifications
         * --------------------------------------------------
         */

        await Notification.insertMany([
            {
                recipient: aarav._id,
                sender: rohan._id,
                type: "learning_request",
                title: "New learning request",
                message:
                    "Rohan Mehta wants to learn React from you.",
                link: "/requests",
                isRead: false,
            },
            {
                recipient: priya._id,
                sender: neha._id,
                type: "learning_request",
                title: "New learning request",
                message:
                    "Neha Kapoor wants to learn Python from you.",
                link: "/requests",
                isRead: false,
            },
            {
                recipient: aarav._id,
                sender: ananya._id,
                type: "request_accepted",
                title: "Learning request accepted",
                message:
                    "Ananya Iyer accepted your request for Docker.",
                link: "/requests",
                isRead: true,
            },
            {
                recipient: ananya._id,
                sender: aarav._id,
                type: "session_completed",
                title: "Session completed",
                message:
                    "Your React learning session has been completed.",
                link: "/sessions",
                isRead: false,
            },
        ]);

        return res.status(200).json({
            success: true,
            message:
                "Demo database reset and generated successfully.",
            data: {
                users: 10,
                skills: skills.length,
                matches: matches.length,
                sessions: sessions.length,
                reviews: 5,
                pendingRequests: 3,
                notifications: 4,
            },
            demoLogin: {
                email: "aarav@skillsync.demo",
                password: "SkillSync123",
            },
        });
    } catch (error) {
        console.error(
            "RESET DEMO DATA ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to reset demo data.",
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
    resetDemoData,
    getAdminHealth,
};