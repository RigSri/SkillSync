const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const matchRoutes = require("./routes/matchRoutes");
const learningRequestRoutes = require("./routes/learningRequestRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/learning-requests", learningRequestRoutes);

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