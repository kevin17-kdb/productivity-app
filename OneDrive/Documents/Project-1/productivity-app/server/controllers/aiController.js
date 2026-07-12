const Task = require("../models/Task");
const jsonDb = require("../utils/jsonDb");
const { getProductivityCoachReport, getCelebrationMessage } = require("../utils/aiHelper");

// GENERATE ANALYTICS AND AI PRODUCTIVITY COACH REPORT
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({ message: "workspaceId is required" });
        }

        // Fetch all tasks for the workspace
        let tasks = [];
        if (global.useJsonDb) {
            tasks = await jsonDb.tasks.find({ workspace: workspaceId });
        } else {
            tasks = await Task.find({ workspace: workspaceId });
        }

        if (tasks.length === 0) {
            return res.json({
                totalTasks: 0,
                completedTasks: 0,
                completionRate: 0,
                categoryStats: {},
                aiCoachReport: "Create some tasks first! I will analyze your progress and guide you once you've completed some tasks."
            });
        }

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const completionRate = Math.round((completedTasks / totalTasks) * 100);

        // Group by category
        const categories = ["Studying", "Health", "Work", "Leisure", "General"];
        const categoryStats = {};

        categories.forEach(cat => {
            const catTasks = tasks.filter(t => t.category === cat);
            const total = catTasks.length;
            const completed = catTasks.filter(t => t.completed).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

            categoryStats[cat] = {
                total,
                completed,
                rate
            };
        });

        // Get AI Report
        const stats = {
            totalTasks,
            completedTasks,
            completionRate,
            categoryStats
        };

        const aiCoachReport = await getProductivityCoachReport(stats);

        res.json({
            ...stats,
            aiCoachReport
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GENERATE 100% COMPLETION AI CELEBRATION MESSAGE
exports.getAICompletionCelebration = async (req, res) => {
    try {
        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "Array of taskIds is required" });
        }

        let tasks = [];
        if (global.useJsonDb) {
            tasks = await Promise.all(taskIds.map(id => jsonDb.tasks.findById(id)));
            tasks = tasks.filter(t => t !== null);
        } else {
            tasks = await Task.find({ _id: { $in: taskIds } });
        }

        const message = await getCelebrationMessage(tasks);

        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
