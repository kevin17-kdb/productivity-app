const MoodLog = require("../models/MoodLog");
const Group = require("../models/Group");
const jsonDb = require("../utils/jsonDb");
const { getMoodAIFeedback } = require("../utils/aiHelper");

// CREATE MOOD LOG
exports.createMoodLog = async (req, res) => {
    try {
        const { score, reason } = req.body;

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ message: "Mood score must be between 1 and 5" });
        }

        if (global.useJsonDb) {
            const aiResponse = await getMoodAIFeedback(score, reason);
            const moodLog = await jsonDb.moodLogs.create({
                user: req.user.id,
                score,
                reason,
                aiResponse
            });
            return res.status(201).json(moodLog);
        }

        // Get AI counselor feedback
        const aiResponse = await getMoodAIFeedback(score, reason);

        const moodLog = new MoodLog({
            user: req.user.id,
            score,
            reason,
            aiResponse
        });

        await moodLog.save();
        res.status(201).json(moodLog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET CURRENT USER'S MOOD LOGS
exports.getMyMoodLogs = async (req, res) => {
    try {
        if (global.useJsonDb) {
            const logs = await jsonDb.moodLogs.find({ user: req.user.id });
            return res.json(logs);
        }

        const logs = await MoodLog.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(30);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET USER MOOD LOGS FOR WORKSPACE ADMIN
// Accessible only by the Architect of the workspace
exports.getUserMoodLogs = async (req, res) => {
    try {
        const { workspaceId, targetUserId } = req.query;

        if (!workspaceId || !targetUserId) {
            return res.status(400).json({ message: "workspaceId and targetUserId are required" });
        }

        if (global.useJsonDb) {
            const logs = await jsonDb.moodLogs.find({ user: targetUserId });
            return res.json(logs);
        }

        const workspace = await Group.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Verify that the requester is the Architect of the workspace
        const requesterMember = workspace.members.find(
            m => m.user.toString() === req.user.id.toString()
        );

        if (!requesterMember || requesterMember.role !== "Architect") {
            return res.status(403).json({ 
                message: "Access denied: Only the Architect (Admin) can view other users' mood logs." 
            });
        }

        // Verify that the target user is indeed a member of this workspace
        const targetMember = workspace.members.find(
            m => m.user.toString() === targetUserId.toString()
        );

        if (!targetMember) {
            return res.status(403).json({ 
                message: "Access denied: Target user is not a member of this workspace." 
            });
        }

        const logs = await MoodLog.find({ user: targetUserId })
            .sort({ createdAt: -1 })
            .limit(30);

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
