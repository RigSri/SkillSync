const Skill = require("../models/Skill");

const addSkill = async (req, res) => {
    try {
        const { name, type, level, category, proof } = req.body;

        if (!name || !type || !level || !category) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        const existingSkill = await Skill.findOne({
            user: req.user.id,
            name,
            type,
        });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message: "Skill already exists.",
            });
        }

        const skill = await Skill.create({
            user: req.user.id,
            name,
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

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    addSkill,
};