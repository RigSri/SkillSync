const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getOrCreateConversation,
    sendMessage,
    getMessages,
    getMyConversations,
} = require("../controllers/chatController");


// Get all conversations for logged-in user
router.get(
    "/my-conversations",
    authMiddleware,
    getMyConversations
);


// Create/get conversation for an active match
router.post(
    "/conversations",
    authMiddleware,
    getOrCreateConversation
);


// Send message
router.post(
    "/messages",
    authMiddleware,
    sendMessage
);


// Get conversation messages
router.get(
    "/conversations/:conversationId/messages",
    authMiddleware,
    getMessages
);


module.exports = router;