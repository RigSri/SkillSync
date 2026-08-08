const mongoose = require("mongoose");

const Session = require("../models/Session");
const Match = require("../models/Match");
const Skill = require("../models/Skill");


// Create a new learning session
const createSession = async (req, res) => {
    try {
        const {
            matchId,
            skillId,
            scheduledAt,
            duration,
            meetingLink,
        } = req.body;

        // Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(matchId) ||
            !mongoose.Types.ObjectId.isValid(skillId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid match ID or skill ID.",
            });
        }

        // Find the match
        const match = await Match.findById(matchId);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found.",
            });
        }

        // User must belong to the match
        const isParticipant = match.users.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this match.",
            });
        }

        // Match must be active
        if (match.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "This match is not active.",
            });
        }

        // Skill must belong to this match
        const skillBelongsToMatch = match.skills.some(
            (matchSkillId) =>
                matchSkillId.toString() === skillId
        );

        if (!skillBelongsToMatch) {
            return res.status(400).json({
                success: false,
                message: "This skill does not belong to the selected match.",
            });
        }

        // Get skill information
        const skill = await Skill.findById(skillId);
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        if (skill.type !== "teach") {
    return res.status(400).json({
        success: false,
        message: "A session can only be created for a skill being taught.",
    });
}
        // Determine teacher
        const teacherId = skill.user;

        // The other participant becomes learner
        const learnerId = match.users.find(
            (userId) =>
                userId.toString() !== teacherId.toString()
        );

        if (!learnerId) {
            return res.status(400).json({
                success: false,
                message: "Could not determine the learner.",
            });
        }

        // Only the match participants can create the session
        if (
            req.user.id !== teacherId.toString() &&
            req.user.id !== learnerId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this session.",
            });
        }

        // Validate scheduled date
        const sessionDate = new Date(scheduledAt);

        if (Number.isNaN(sessionDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheduled date.",
            });
        }

        // Session must be scheduled in the future
        if (sessionDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Session must be scheduled for a future date.",
            });
        }

        // Create session
        const session = await Session.create({
            match: matchId,
            skill: skillId,
            teacher: teacherId,
            learner: learnerId,
            scheduledAt: sessionDate,
            duration: duration || 60,
            meetingLink: meetingLink || "",
        });

        const populatedSession = await Session.findById(session._id)
            .populate(
                "match",
                "users skills status"
            )
            .populate(
                "skill",
                "name type level category proof"
            )
            .populate(
                "teacher",
                "name email profilePicture bio city timezone"
            )
            .populate(
                "learner",
                "name email profilePicture bio city timezone"
            );

        return res.status(201).json({
            success: true,
            message: "Session scheduled successfully.",
            data: populatedSession,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get sessions for the logged-in user
const getMySessions = async (req, res) => {
    try {
        const sessions = await Session.find({
            $or: [
                { teacher: req.user.id },
                { learner: req.user.id },
            ],
        })
            .populate(
                "skill",
                "name type level category"
            )
            .populate(
                "teacher",
                "name email profilePicture"
            )
            .populate(
                "learner",
                "name email profilePicture"
            )
            .populate(
                "match",
                "users skills status"
            )
            .sort({ scheduledAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Sessions fetched successfully.",
            count: sessions.length,
            data: sessions,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Get one session
const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        const session = await Session.findById(id)
            .populate(
                "skill",
                "name type level category"
            )
            .populate(
                "teacher",
                "name email profilePicture bio city timezone"
            )
            .populate(
                "learner",
                "name email profilePicture bio city timezone"
            )
            .populate(
                "match",
                "users skills status"
            );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found.",
            });
        }

        const isParticipant =
            session.teacher._id.toString() === req.user.id ||
            session.learner._id.toString() === req.user.id;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this session.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Session fetched successfully.",
            data: session,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Update session notes/resources
const updateSession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found.",
            });
        }

        const isParticipant =
            session.teacher.toString() === req.user.id ||
            session.learner.toString() === req.user.id;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this session.",
            });
        }

        if (session.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled sessions cannot be updated.",
            });
        }

        const { notes, resources } = req.body;

        if (notes !== undefined) {
            session.notes = notes;
        }

        if (resources !== undefined) {
            session.resources = resources;
        }

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session updated successfully.",
            data: session,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Mark session as completed
const completeSession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found.",
            });
        }

        const isParticipant =
            session.teacher.toString() === req.user.id ||
            session.learner.toString() === req.user.id;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this session.",
            });
        }

        if (session.status !== "scheduled") {
            return res.status(400).json({
                success: false,
                message: "Only scheduled sessions can be completed.",
            });
        }

        session.status = "completed";

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session marked as completed.",
            data: session,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// Cancel session
const cancelSession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found.",
            });
        }

        const isParticipant =
            session.teacher.toString() === req.user.id ||
            session.learner.toString() === req.user.id;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this session.",
            });
        }

        if (session.status !== "scheduled") {
            return res.status(400).json({
                success: false,
                message: "Only scheduled sessions can be cancelled.",
            });
        }

        session.status = "cancelled";

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session cancelled successfully.",
            data: session,
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
    createSession,
    getMySessions,
    getSessionById,
    updateSession,
    completeSession,
    cancelSession,
};