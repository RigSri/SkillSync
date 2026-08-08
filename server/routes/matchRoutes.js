const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getMatches,
    getMyMatches,
} = require("../controllers/matchController");

// Skill-based recommendations
router.get("/", authMiddleware, getMatches);

// Actual accepted matches
router.get("/my-matches", authMiddleware, getMyMatches);

module.exports = router;