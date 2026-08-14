const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

const {
    startSessionReminderService,
} = require("./services/sessionReminderService");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    startSessionReminderService();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();