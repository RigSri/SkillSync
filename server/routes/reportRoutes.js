const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createReport,
    getMyReports,
} = require("../controllers/reportController");


router.post(
    "/",
    authMiddleware,
    createReport
);

router.get(
    "/my-reports",
    authMiddleware,
    getMyReports
);


module.exports = router;