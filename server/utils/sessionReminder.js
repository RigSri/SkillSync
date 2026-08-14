const Session = require("../models/Session");
const Notification = require("../models/Notification");

const REMINDER_WINDOW_START = 29 * 60 * 1000;
const REMINDER_WINDOW_END = 31 * 60 * 1000;

const createSessionReminder = async (session, userId) => {
    try {
        const notificationExists =
            await Notification.findOne({
                recipient: userId,
                type: "session_reminder",
                relatedId: session._id,
            });

        if (notificationExists) {
            return;
        }

        await Notification.create({
            recipient: userId,
            sender: null,
            type: "session_reminder",
            title: "Upcoming session",
            message:
                "Your session starts in about 30 minutes.",
            link: `/sessions/${session._id}`,
            relatedId: session._id,
        });
    } catch (error) {
        // A duplicate reminder should never crash
        // the scheduler.
        if (error.code !== 11000) {
            console.error(
                "Session reminder error:",
                error
            );
        }
    }
};

const checkUpcomingSessions = async () => {
    try {
        const now = Date.now();

        const start =
            new Date(
                now + REMINDER_WINDOW_START
            );

        const end =
            new Date(
                now + REMINDER_WINDOW_END
            );

        const sessions =
            await Session.find({
                status: "scheduled",
                scheduledAt: {
                    $gte: start,
                    $lt: end,
                },
            });

        for (const session of sessions) {
            await createSessionReminder(
                session,
                session.teacher
            );

            await createSessionReminder(
                session,
                session.learner
            );
        }

        if (sessions.length > 0) {
            console.log(
                `Session reminder check: ${sessions.length} upcoming session(s).`
            );
        }
    } catch (error) {
        console.error(
            "Unable to check upcoming sessions:",
            error
        );
    }
};

const startSessionReminderScheduler = () => {
    // Run once shortly after server startup.
    checkUpcomingSessions();

    // Check every minute.
    setInterval(
        checkUpcomingSessions,
        60 * 1000
    );

    console.log(
        "Session reminder scheduler started."
    );
};

module.exports = {
    startSessionReminderScheduler,
};