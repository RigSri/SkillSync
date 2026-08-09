const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select(
            "role isBlocked"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked.",
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required.",
            });
        }

        next();
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

module.exports = adminMiddleware;