const Skill = require("../models/Skill");
const Match = require("../models/Match");
const User = require("../models/User");

// Get skill-based recommendations
const getMatches = async (req, res) => {
    try {
        // Logged-in user's skills
        const mySkills = await Skill.find({
            user: req.user.id,
        });

        // Separate into teach and learn arrays
        const teachSkills = mySkills
            .filter((skill) => skill.type === "teach")
            .map((skill) => skill.name);

        const learnSkills = mySkills
            .filter((skill) => skill.type === "learn")
            .map((skill) => skill.name);

        // Fetch all other users' skills
        // Admin accounts are excluded from normal matching.
        const otherSkills = await Skill.find({
            user: {
                $ne: req.user.id,
            },
        }).populate(
            "user",
            "name email profilePicture role isBlocked"
        );

        // Group skills by user
        const usersMap = {};

        for (const skill of otherSkills) {
            // Skip deleted/invalid users
            if (!skill.user) {
                continue;
            }

            // Do not expose admins or blocked users
            if (
                skill.user.role === "admin" ||
                skill.user.isBlocked
            ) {
                continue;
            }

            const userId =
                skill.user._id.toString();

            if (!usersMap[userId]) {
                usersMap[userId] = {
                    userId,
                    name: skill.user.name,
                    email: skill.user.email,
                    teach: [],
                    learn: [],
                };
            }

            if (skill.type === "teach") {
                usersMap[userId].teach.push({
                    id: skill._id.toString(),
                    name: skill.name,
                    level: skill.level,
                    category: skill.category,
                });
            } else {
                usersMap[userId].learn.push({
                    id: skill._id.toString(),
                    name: skill.name,
                    level: skill.level,
                    category: skill.category,
                });
            }
        }

        const perfectMatches = [];
        const canTeachYou = [];
        const wantToLearnFromYou = [];

        for (const user of Object.values(usersMap)) {
            const matchedTeach =
                user.learn.filter((skill) =>
                    teachSkills.includes(skill.name)
                );

            const matchedLearn =
                user.teach.filter((skill) =>
                    learnSkills.includes(skill.name)
                );

            // Perfect match
            if (
                matchedTeach.length > 0 &&
                matchedLearn.length > 0
            ) {
                perfectMatches.push({
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    matchedTeach,
                    matchedLearn,
                });
            }

            // User can teach you
            else if (matchedLearn.length > 0) {
                canTeachYou.push({
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    skills: matchedLearn,
                });
            }

            // User wants to learn from you
            else if (matchedTeach.length > 0) {
                wantToLearnFromYou.push({
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    skills: matchedTeach,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Matches fetched successfully.",
            data: {
                perfectMatches,
                canTeachYou,
                wantToLearnFromYou,
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

// Get actual accepted matches
const getMyMatches = async (req, res) => {
    try {
        const matches = await Match.find({
            users: req.user.id,
            status: "active",
        })
            .populate(
                "users",
                "name email profilePicture bio city timezone role isBlocked"
            )
            .populate(
                "skills",
                "name type level category proof"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Your matches fetched successfully.",
            count: matches.length,
            data: matches,
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
    getMatches,
    getMyMatches,
};