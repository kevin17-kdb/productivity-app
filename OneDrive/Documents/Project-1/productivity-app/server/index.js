require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection event error:", err.message);
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
        console.log("MongoDB connected to Atlas Cluster successfully 🚀");
    } catch (err) {
        console.warn("⚠️ MongoDB Atlas connection failed (likely an IP whitelisting issue).");
        console.warn("Attempting fallback to local MongoDB (127.0.0.1:27017)...");
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/productivity-app", { serverSelectionTimeoutMS: 4000 });
            console.log("Local MongoDB connection established successfully 🔌");
        } catch (localErr) {
            console.error("❌ Both MongoDB Atlas and Local MongoDB connections failed.");
            console.error("Atlas Error:", err.message);
            console.error("Local Error:", localErr.message);
            console.warn("\n📁 FALLBACK ACTIVATED: Starting server in Local Offline JSON Database Mode! (Data will be stored in server/data/)");
            global.useJsonDb = true;
        }
    }
};
connectDB();

app.get("/", (req, res) => {
    res.send("API Running");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const groupRoutes = require("./routes/groupRoutes");
app.use("/api/groups", groupRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const moodRoutes = require("./routes/moodRoutes");
app.use("/api/moods", moodRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

const workLogRoutes = require("./routes/workLogRoutes");
app.use("/api/worklog", workLogRoutes);

const trackerRoutes = require("./routes/trackerRoutes");
app.use("/api/trackers", trackerRoutes);

const reminderRoutes = require("./routes/reminderRoutes");
app.use("/api/reminders", reminderRoutes);

const notesRoutes = require("./routes/notesRoutes");
app.use("/api/notes", notesRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ message: "Internal server error" });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
