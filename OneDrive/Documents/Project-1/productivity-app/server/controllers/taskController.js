const Task = require("../models/Task");
const Group = require("../models/Group");
const jsonDb = require("../utils/jsonDb");

// Helper function to check if a user is an Architect in a workspace
const isArchitect = (group, userId) => {
    const member = group.members.find(m => m.user.toString() === userId.toString());
    return member && member.role === "Architect";
};

// CREATE TASK
exports.createTask = async (req, res) => {
    try {
        const { title, type, date, hourSlot, dayOfWeek, dayOfMonth, deadline, category, assignedTo } = req.body;

        if (global.useJsonDb) {
            const task = await jsonDb.tasks.create({
                workspace: req.body.workspace || req.workspace._id,
                title,
                type,
                date,
                hourSlot,
                dayOfWeek,
                dayOfMonth,
                deadline,
                category,
                assignedTo: assignedTo || null,
                createdBy: req.user.id
            });
            return res.status(201).json(task);
        }

        const task = new Task({
            workspace: req.workspace._id,
            title,
            type,
            date,
            hourSlot,
            dayOfWeek,
            dayOfMonth,
            deadline,
            category,
            assignedTo: assignedTo || null,
            createdBy: req.user.id
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET TASKS FOR WORKSPACE
exports.getTasks = async (req, res) => {
    try {
        const { workspaceId, type, date } = req.query;

        if (global.useJsonDb) {
            const tasks = await jsonDb.tasks.find({
                workspace: workspaceId,
                type,
                date
            });
            return res.json(tasks);
        }

        let query = { workspace: workspaceId };

        if (type) query.type = type;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        let tasks = await Task.find(query)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        tasks = tasks.map(task => {
            const taskObj = task.toObject();
            taskObj.privateNotes = taskObj.privateNotes.filter(
                note => note.user.toString() === req.user.id.toString()
            );
            return taskObj;
        });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE TASK DETAILS
exports.updateTask = async (req, res) => {
    try {
        if (global.useJsonDb) {
            const allowedUpdates = [
                "title", "type", "date", "hourSlot", 
                "dayOfWeek", "dayOfMonth", "deadline", 
                "category", "assignedTo"
            ];
            const updates = {};
            allowedUpdates.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            });
            const updated = await jsonDb.tasks.update(req.params.id, updates);
            return res.json(updated);
        }

        const task = req.task; 
        const workspace = req.workspace; 

        if (req.userWorkspaceRole === "Planner") {
            const isCreatorArchitect = isArchitect(workspace, task.createdBy);
            if (isCreatorArchitect) {
                return res.status(403).json({ 
                    message: "Access Denied: Planners cannot modify tasks posted by the Architect (Admin)." 
                });
            }
        }

        const allowedUpdates = [
            "title", "type", "date", "hourSlot", 
            "dayOfWeek", "dayOfMonth", "deadline", 
            "category", "assignedTo"
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// TOGGLE TASK COMPLETION
exports.toggleComplete = async (req, res) => {
    try {
        const nextCompleted = typeof req.body.completed === "boolean" ? req.body.completed : null;

        if (global.useJsonDb) {
            const task = await jsonDb.tasks.findById(req.params.id);
            if (!task) return res.status(404).json({ message: "Task not found" });
            const updated = await jsonDb.tasks.update(req.params.id, { completed: nextCompleted === null ? !task.completed : nextCompleted });
            return res.json(updated);
        }

        const task = req.task; 
        task.completed = nextCompleted === null ? !task.completed : nextCompleted;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
    try {
        if (global.useJsonDb) {
            await jsonDb.tasks.delete(req.params.id);
            return res.json({ message: "Task deleted successfully" });
        }

        const task = req.task; 
        await Task.findByIdAndDelete(task._id);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADD ATTACHMENT
exports.addAttachment = async (req, res) => {
    try {
        const { fileName, url } = req.body;
        if (!fileName || !url) {
            return res.status(400).json({ message: "File name and URL are required" });
        }

        if (global.useJsonDb) {
            const task = await jsonDb.tasks.findById(req.params.id);
            if (!task) return res.status(404).json({ message: "Task not found" });
            const attachments = [...(task.attachments || [])];
            attachments.push({ fileName, url, uploadedBy: req.user.id });
            const updated = await jsonDb.tasks.update(req.params.id, { attachments });
            return res.json(updated);
        }

        const task = req.task;
        task.attachments.push({
            fileName,
            url,
            uploadedBy: req.user.id
        });

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SAVE OR UPDATE PRIVATE NOTE
exports.savePrivateNote = async (req, res) => {
    try {
        const { content } = req.body;

        if (global.useJsonDb) {
            const task = await jsonDb.tasks.findById(req.params.id);
            if (!task) return res.status(404).json({ message: "Task not found" });
            const privateNotes = [...(task.privateNotes || [])];
            const idx = privateNotes.findIndex(n => n.user === req.user.id);
            if (idx > -1) {
                privateNotes[idx].content = content;
            } else {
                privateNotes.push({ user: req.user.id, content });
            }
            const updated = await jsonDb.tasks.update(req.params.id, { privateNotes });
            
            const responseObj = { ...updated };
            responseObj.privateNotes = responseObj.privateNotes.filter(n => n.user === req.user.id);
            return res.json(responseObj);
        }

        const task = req.task;
        const noteIndex = task.privateNotes.findIndex(
            note => note.user.toString() === req.user.id.toString()
        );

        if (noteIndex > -1) {
            task.privateNotes[noteIndex].content = content;
        } else {
            task.privateNotes.push({
                user: req.user.id,
                content
            });
        }

        await task.save();
        
        const taskObj = task.toObject();
        taskObj.privateNotes = taskObj.privateNotes.filter(
            note => note.user.toString() === req.user.id.toString()
        );

        res.json(taskObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
