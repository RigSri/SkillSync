const Notification = require("../models/Notification");

// Get notifications for logged-in user
const getMyNotifications = async (req, res) => {
    try {
        const notifications =
            await Notification.find({
                recipient: req.user.id,
            })
                .populate(
                    "sender",
                    "name email profilePicture"
                )
                .sort({ createdAt: -1 })
                .limit(30);

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user.id,
                isRead: false,
            });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch notifications.",
        });
    }
};

// Mark one notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification =
            await Notification.findOne({
                _id: id,
                recipient: req.user.id,
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found.",
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            data: notification,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notification.",
        });
    }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (
    req,
    res
) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user.id,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read.",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to update notifications.",
        });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};