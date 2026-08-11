const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} = require("../controllers/notificationController");

// Get my notifications
router.get(
    "/",
    authMiddleware,
    getMyNotifications
);

// Mark all as read
router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsRead
);

// Mark one as read
router.patch(
    "/:id/read",
    authMiddleware,
    markNotificationAsRead
);

module.exports = router;