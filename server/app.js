const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const matchRoutes = require("./routes/matchRoutes");
const learningRequestRoutes = require("./routes/learningRequestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const chatRoutes = require("./routes/chatRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/learning-requests", learningRequestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SkillSync API is Running...",
    });
});

// Error Handler (Keep this LAST)
app.use(errorHandler);

module.exports = app;