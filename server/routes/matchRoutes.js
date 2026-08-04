const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getMatches } = require("../controllers/matchController");

router.get("/", authMiddleware, getMatches);

module.exports = router;