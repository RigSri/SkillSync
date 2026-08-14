const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getUsers,
    getReports,
    getFlaggedUsers,
    getAnalytics,
    updateReportStatus,
    blockUser,
    unblockUser,
    resetDemoData,
    getAdminHealth,
} = require("../controllers/adminController");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get(
    "/users",
    getUsers
);

router.get(
    "/reports",
    getReports
);

router.get(
    "/flagged-users",
    getFlaggedUsers
);

router.patch(
    "/reports/:reportId",
    updateReportStatus
);

router.patch(
    "/users/:userId/block",
    blockUser
);

router.patch(
    "/users/:userId/unblock",
    unblockUser
);

router.post(
    "/demo-data/reset",
    resetDemoData
);

router.get(
    "/analytics",
    getAnalytics
);

router.get(
    "/health",
    getAdminHealth
);

module.exports = router;