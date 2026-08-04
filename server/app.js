const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const app = express();
const skillRoutes = require("./routes/skillRoutes");
const matchRoutes = require("./routes/matchRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes);

app.get("/", (req, res) => {
    res.send("SkillSync API is Running...");
});
module.exports = app;