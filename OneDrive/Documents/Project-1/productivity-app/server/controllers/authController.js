const User = require("../models/User");
const Group = require("../models/Group");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jsonDb = require("../utils/jsonDb");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (global.useJsonDb) {
            const existingUser = await jsonDb.users.findOne({ email });
            if (existingUser) return res.status(400).json({ message: "User already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await jsonDb.users.create({ name, email, password: hashedPassword });
            
            // Auto-scaffold a default workspace for offline JSON mode
            await jsonDb.groups.create({
                name: "General Workspace",
                owner: newUser._id,
                members: [
                    { user: newUser._id, role: "Architect" }
                ]
            });

            return res.json({ message: "User registered successfully (Local Offline DB)" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Auto-scaffold a default workspace for Mongoose mode
        const defaultGroup = new Group({
            name: "General Workspace",
            owner: user._id,
            members: [
                { user: user._id, role: "Architect" }
            ]
        });
        await defaultGroup.save();

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (global.useJsonDb) {
            const user = await jsonDb.users.findOne({ email });
            if (!user) return res.status(400).json({ message: "User not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
            return res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

        const userObj = user.toObject();
        delete userObj.password;
        res.json({ token, user: userObj });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};