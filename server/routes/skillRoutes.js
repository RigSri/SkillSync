const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addSkill,
    getMySkills,
    updateSkill,
    deleteSkill,
} = require("../controllers/skillController");

router.post("/", authMiddleware, addSkill);
router.get("/my-skills", authMiddleware, getMySkills);
router.put("/:id", authMiddleware, updateSkill);
router.delete("/:id", authMiddleware, deleteSkill);
module.exports = router;