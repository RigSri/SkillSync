const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getCurrentUser,
    updateProfile,
    updateAvailability,
    getUserCredibility,
    getUserProfile,
    searchUsers,
    searchSkillPartners,
} = require("../controllers/userController");

// Get current user
router.get("/me", authMiddleware, getCurrentUser);

// Update profile
router.put("/me", authMiddleware, updateProfile);

// Update availability
router.put("/me/availability", authMiddleware, updateAvailability);

// Get another user's public profile
router.get(
    "/:userId/profile",
    authMiddleware,
    getUserProfile
);
router.get(
    "/search",
    authMiddleware,
    searchUsers
);
router.get(
    "/skill-search",
    authMiddleware,
    searchSkillPartners
);
// Get another user's credibility
router.get(
    "/:userId/credibility",
    authMiddleware,
    getUserCredibility
);

router.get(
    "/skill-search",
    authMiddleware,
    searchSkillPartners
);
module.exports = router;