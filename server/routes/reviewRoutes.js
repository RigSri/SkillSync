const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createReview,
    getUserReviews,
    getMyReviews,
} = require("../controllers/reviewController");


// Submit a review
router.post("/", authMiddleware, createReview);

// Reviews written by logged-in user
router.get("/my-reviews", authMiddleware, getMyReviews);

// Reviews received by a user
router.get("/user/:userId", authMiddleware, getUserReviews);


module.exports = router;