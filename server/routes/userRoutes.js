const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getCurrentUser,
    updateProfile,
    updateAvailability,
    getUserCredibility,
} = require("../controllers/userController");


// Get current user
router.get("/me", authMiddleware, getCurrentUser);

// Update profile
router.put("/me", authMiddleware, updateProfile);

// Update availability
router.put("/me/availability", authMiddleware, updateAvailability);

// Get another user's credibility
router.get(
    "/:userId/credibility",
    authMiddleware,
    getUserCredibility
);


module.exports = router;