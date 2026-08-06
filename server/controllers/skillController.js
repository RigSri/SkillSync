const mongoose = require("mongoose");
const Skill = require("../models/Skill");

const addSkill = async (req, res) => {
    try {
        const { name, type, level, category, proof } = req.body;

        if (!name || !name.trim() || !type || !level) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        const normalizedName = name.trim().toLowerCase();

        const existingSkill = await Skill.findOne({
            user: req.user.id,
            name: normalizedName,
            type,
        });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message: "You already have this skill.",
            });
        }

        const skill = await Skill.create({
            user: req.user.id,
            name: normalizedName,
            type,
            level,
            category,
            proof,
        });

        return res.status(201).json({
            success: true,
            message: "Skill added successfully.",
            data: skill,
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You already have this skill.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getMySkills = async (req, res) => {
    try {
        const skills = await Skill.find({
            user: req.user.id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: skills.length,
            data: skills,
        });

    } catch (error) {
        console.error(error);

        return res.status(200).json({
    success: true,
    message: "Skills fetched successfully.",
    count: skills.length,
    data: skills,
});
    }
};

const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID.",
            });
        }

        const { name, type, level, category, proof } = req.body;

        const skill = await Skill.findById(id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        if (skill.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        if (name && name.trim()) {
            skill.name = name.trim().toLowerCase();
        }

        if (type) {
            skill.type = type;
        }

        if (level) {
            skill.level = level;
        }

        if (category) {
            skill.category = category;
        }

        if (proof !== undefined) {
            skill.proof = proof;
        }

        await skill.save();

        return res.status(200).json({
            success: true,
            message: "Skill updated successfully.",
            data: skill,
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You already have this skill.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID.",
            });
        }

        const skill = await Skill.findById(id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        if (skill.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        await skill.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Skill deleted successfully.",
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
    addSkill,
    getMySkills,
    updateSkill,
    deleteSkill,
};