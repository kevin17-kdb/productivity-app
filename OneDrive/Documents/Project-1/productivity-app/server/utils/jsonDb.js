const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON file
const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content || "[]");
    } catch (e) {
        return [];
    }
};

// Helper to write JSON file
const writeData = (filename, data) => {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Generate Mock Object ID
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

module.exports = {
    // --- USERS ---
    users: {
        find: async (query) => {
            const data = readData("users.json");
            return data.filter(u => Object.entries(query).every(([k, v]) => u[k] === v));
        },
        findOne: async (query) => {
            const data = readData("users.json");
            return data.find(u => Object.entries(query).every(([k, v]) => u[k] === v)) || null;
        },
        findById: async (id) => {
            const data = readData("users.json");
            return data.find(u => u._id === id) || null;
        },
        create: async (userData) => {
            const data = readData("users.json");
            const newUser = { _id: generateId(), ...userData, createdAt: new Date() };
            data.push(newUser);
            writeData("users.json", data);
            return newUser;
        }
    },

    // --- GROUPS (WORKSPACES) ---
    groups: {
        find: async (query) => {
            const data = readData("groups.json");
            let filtered = [];
            // Check membership query: "members.user": userId
            if (query["members.user"]) {
                const userId = query["members.user"];
                filtered = data.filter(g => g.members.some(m => (m.user._id || m.user) === userId));
            } else {
                filtered = data.filter(g => Object.entries(query).every(([k, v]) => g[k] === v));
            }
            
            // Populate members
            const users = readData("users.json");
            return filtered.map(group => {
                const populatedMembers = group.members.map(m => {
                    const userObj = users.find(u => u._id === (m.user._id || m.user)) || { name: "Unknown", email: "" };
                    return {
                        user: { _id: userObj._id, name: userObj.name, email: userObj.email },
                        role: m.role
                    };
                });
                return { ...group, members: populatedMembers };
            });
        },
        findById: async (id) => {
            const data = readData("groups.json");
            const group = data.find(g => g._id === id);
            if (!group) return null;
            // Populating members.user info for response
            const users = readData("users.json");
            const populatedMembers = group.members.map(m => {
                const userObj = users.find(u => u._id === (m.user._id || m.user)) || { name: "Unknown", email: "" };
                return {
                    user: { _id: userObj._id, name: userObj.name, email: userObj.email },
                    role: m.role
                };
            });
            return { ...group, members: populatedMembers };
        },
        create: async (groupData) => {
            const data = readData("groups.json");
            const newGroup = { _id: generateId(), ...groupData, createdAt: new Date() };
            data.push(newGroup);
            writeData("groups.json", data);

            // Populate and return
            const users = readData("users.json");
            const populatedMembers = newGroup.members.map(m => {
                const userObj = users.find(u => u._id === (m.user._id || m.user)) || { name: "Unknown", email: "" };
                return {
                    user: { _id: userObj._id, name: userObj.name, email: userObj.email },
                    role: m.role
                };
            });
            return { ...newGroup, members: populatedMembers };
        },
        addMember: async (groupId, userId, role) => {
            const data = readData("groups.json");
            const idx = data.findIndex(g => g._id === groupId);
            if (idx === -1) throw new Error("Workspace not found");
            
            // Check if member already exists
            const exists = data[idx].members.some(m => (m.user._id || m.user) === userId);
            if (!exists) {
                data[idx].members.push({ user: userId, role });
                writeData("groups.json", data);
            }
            return data[idx];
        }
    },

    // --- TASKS ---
    tasks: {
        find: async (query) => {
            const data = readData("tasks.json");
            let filtered = data.filter(t => {
                if (query.workspace && t.workspace !== query.workspace) return false;
                if (query.type && t.type !== query.type) return false;
                
                // Date filter logic
                if (query.date && query.date.$gte && query.date.$lte) {
                    const taskDate = new Date(t.date);
                    if (taskDate < query.date.$gte || taskDate > query.date.$lte) return false;
                }
                return true;
            });

            // Populate assignedTo and createdBy
            const users = readData("users.json");
            return filtered.map(t => {
                const assignedUser = users.find(u => u._id === t.assignedTo) || null;
                const creatorUser = users.find(u => u._id === t.createdBy) || null;
                return {
                    ...t,
                    assignedTo: assignedUser ? { _id: assignedUser._id, name: assignedUser.name, email: assignedUser.email } : null,
                    createdBy: creatorUser ? { _id: creatorUser._id, name: creatorUser.name, email: creatorUser.email } : null
                };
            });
        },
        findById: async (id) => {
            const data = readData("tasks.json");
            return data.find(t => t._id === id) || null;
        },
        create: async (taskData) => {
            const data = readData("tasks.json");
            const newTask = { 
                _id: generateId(), 
                completed: false,
                attachments: [],
                privateNotes: [],
                ...taskData, 
                createdAt: new Date() 
            };
            data.push(newTask);
            writeData("tasks.json", data);
            return newTask;
        },
        update: async (id, updateData) => {
            const data = readData("tasks.json");
            const idx = data.findIndex(t => t._id === id);
            if (idx === -1) throw new Error("Task not found");
            data[idx] = { ...data[idx], ...updateData, updatedAt: new Date() };
            writeData("tasks.json", data);
            return data[idx];
        },
        delete: async (id) => {
            let data = readData("tasks.json");
            data = data.filter(t => t._id !== id);
            writeData("tasks.json", data);
        }
    },

    // --- MOOD LOGS ---
    moodLogs: {
        find: async (query) => {
            const data = readData("moodlogs.json");
            return data
                .filter(l => l.user === query.user)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        create: async (moodData) => {
            const data = readData("moodlogs.json");
            const newLog = { _id: generateId(), ...moodData, createdAt: new Date() };
            data.push(newLog);
            writeData("moodlogs.json", data);
            return newLog;
        }
    },

    // --- WORK LOGS ---
    worklogs: {
        find: async (query) => {
            const data = readData("worklogs.json");
            return data.filter(w => Object.entries(query).every(([k, v]) => w[k] === v));
        },
        findOne: async (query) => {
            const data = readData("worklogs.json");
            return data.find(w => Object.entries(query).every(([k, v]) => w[k] === v)) || null;
        },
        create: async (logData) => {
            const data = readData("worklogs.json");
            const newLog = { _id: generateId(), ...logData, createdAt: new Date() };
            data.push(newLog);
            writeData("worklogs.json", data);
            return newLog;
        },
        update: async (id, updateData) => {
            const data = readData("worklogs.json");
            const idx = data.findIndex(w => w._id === id);
            if (idx === -1) throw new Error("WorkLog not found");
            data[idx] = { ...data[idx], ...updateData, updatedAt: new Date() };
            writeData("worklogs.json", data);
            return data[idx];
        }
    },

    // --- TRACKERS ---
    trackers: {
        find: async (query) => {
            const data = readData("trackers.json");
            return data.filter(t => Object.entries(query).every(([k, v]) => t[k] === v));
        },
        findById: async (id) => {
            const data = readData("trackers.json");
            return data.find(t => t._id === id) || null;
        },
        create: async (trackerData) => {
            const data = readData("trackers.json");
            const newTracker = { _id: generateId(), ...trackerData, createdAt: new Date() };
            data.push(newTracker);
            writeData("trackers.json", data);
            return newTracker;
        },
        update: async (id, updateData) => {
            const data = readData("trackers.json");
            const idx = data.findIndex(t => t._id === id);
            if (idx === -1) throw new Error("Tracker not found");
            data[idx] = { ...data[idx], ...updateData, updatedAt: new Date() };
            writeData("trackers.json", data);
            return data[idx];
        },
        delete: async (id) => {
            let data = readData("trackers.json");
            data = data.filter(t => t._id !== id);
            writeData("trackers.json", data);
        }
    },

    // --- REMINDERS ---
    reminders: {
        find: async (query) => {
            const data = readData("reminders.json");
            return data.filter(r => Object.entries(query).every(([k, v]) => r[k] === v));
        },
        findById: async (id) => {
            const data = readData("reminders.json");
            return data.find(r => r._id === id) || null;
        },
        create: async (reminderData) => {
            const data = readData("reminders.json");
            const newReminder = { _id: generateId(), ...reminderData, createdAt: new Date() };
            data.push(newReminder);
            writeData("reminders.json", data);
            return newReminder;
        },
        update: async (id, updateData) => {
            const data = readData("reminders.json");
            const idx = data.findIndex(r => r._id === id);
            if (idx === -1) throw new Error("Reminder not found");
            data[idx] = { ...data[idx], ...updateData };
            writeData("reminders.json", data);
            return data[idx];
        }
    },

    // --- NOTES ---
    notes: {
        find: async (query) => {
            const data = readData("notes.json");
            return data.filter(n => Object.entries(query).every(([k, v]) => n[k] === v));
        },
        findById: async (id) => {
            const data = readData("notes.json");
            return data.find(n => n._id === id) || null;
        },
        create: async (noteData) => {
            const data = readData("notes.json");
            const newNote = { _id: generateId(), ...noteData, createdAt: new Date() };
            data.push(newNote);
            writeData("notes.json", data);
            return newNote;
        },
        update: async (id, updateData) => {
            const data = readData("notes.json");
            const idx = data.findIndex(n => n._id === id);
            if (idx === -1) throw new Error("Note not found");
            data[idx] = { ...data[idx], ...updateData, updatedAt: new Date() };
            writeData("notes.json", data);
            return data[idx];
        },
        delete: async (id) => {
            let data = readData("notes.json");
            data = data.filter(n => n._id !== id);
            writeData("notes.json", data);
        }
    }
};
