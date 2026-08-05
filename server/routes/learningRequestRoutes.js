const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    sendLearningRequest,
    getSentRequests,
    getReceivedRequests,
    acceptLearningRequest,
    rejectLearningRequest,
    cancelLearningRequest,
} = require("../controllers/learningRequestController");

router.post("/", authMiddleware, sendLearningRequest);

router.get("/sent", authMiddleware, getSentRequests);

router.get("/received", authMiddleware, getReceivedRequests);

router.patch("/:id/accept", authMiddleware, acceptLearningRequest);

router.patch("/:id/reject", authMiddleware, rejectLearningRequest);

router.patch("/:id/cancel", authMiddleware, cancelLearningRequest);

module.exports = router;