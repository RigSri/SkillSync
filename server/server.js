const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");
const learningRequestRoutes = require("./routes/learningRequestRoutes");
app.use("/api/learning-requests", learningRequestRoutes);
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});