const Session = require("../models/Session");
const Notification = require("../models/Notification");

const REMINDER_WINDOW_MINUTES = 15;

const createUpcomingSessionReminders = async () => {
    const now = new Date();
    const windowEnd = new Date(
        now.getTime() +
            REMINDER_WINDOW_MINUTES * 60 * 1000
    );

    const sessions = await Session.find({
        status: "scheduled",
        scheduledAt: {
            $gt: now,
            $lte: windowEnd,
        },
    }).populate("skill", "name");

    for (const session of sessions) {
        const existingReminder = await Notification.findOne({
            type: "session_reminder",
            relatedId: session._id,
        });

        if (existingReminder) {
            continue;
        }

        const formattedTime = session.scheduledAt.toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
            }
        );

        await Notification.insertMany([
            {
                recipient: session.teacher,
                sender: session.learner,
                type: "session_reminder",
                title: "Session reminder",
                message: `Your ${session.skill?.name || "learning"} session starts soon at ${formattedTime}.`,
                link: "/sessions",
                relatedId: session._id,
            },
            {
                recipient: session.learner,
                sender: session.teacher,
                type: "session_reminder",
                title: "Session reminder",
                message: `Your ${session.skill?.name || "learning"} session starts soon at ${formattedTime}.`,
                link: "/sessions",
                relatedId: session._id,
            },
        ]);
    }
};

const startSessionReminderService = () => {
    const run = async () => {
        try {
            await createUpcomingSessionReminders();
        } catch (error) {
            console.error(
                "SESSION REMINDER SERVICE ERROR:",
                error
            );
        }
    };

    run();
    return setInterval(run, 30 * 1000);
};

module.exports = {
    startSessionReminderService,
    createUpcomingSessionReminders,
};
