const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createSession,
    getMySessions,
    getSessionById,
    updateSession,
    completeSession,
    cancelSession,
} = require("../controllers/sessionController");

// Create a session
router.post("/", authMiddleware, createSession);

// Get logged-in user's sessions
router.get("/my-sessions", authMiddleware, getMySessions);

// Get one session
router.get("/:id", authMiddleware, getSessionById);

// Update notes/resources
router.patch("/:id", authMiddleware, updateSession);

// Complete session
router.patch("/:id/complete", authMiddleware, completeSession);

// Cancel session
router.patch("/:id/cancel", authMiddleware, cancelSession);

module.exports = router;