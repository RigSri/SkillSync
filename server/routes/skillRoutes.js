const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { addSkill } = require("../controllers/skillController");

router.post("/", authMiddleware, addSkill);

module.exports = router;