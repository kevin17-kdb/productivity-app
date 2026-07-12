const Group = require("../models/Group");
const jsonDb = require("../utils/jsonDb");

// CREATE GROUP
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;

        if (global.useJsonDb) {
            const group = await jsonDb.groups.create({
                name,
                owner: req.user.id,
                members: [
                    { user: req.user.id, role: "Architect" }
                ]
            });
            return res.json(group);
        }

        const group = new Group({
            name,
            owner: req.user.id,
            members: [
                { user: req.user.id, role: "Architect" }
            ]
        });

        await group.save();
        res.json(group);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADD MEMBER
exports.addMember = async (req, res) => {
    try {
        const { groupId, userId, role } = req.body;

        if (global.useJsonDb) {
            // Find target user by email in json database
            const targetUser = await jsonDb.users.findOne({ email: userId });
            const targetId = targetUser ? targetUser._id : userId;
            const group = await jsonDb.groups.addMember(groupId, targetId, role);
            const populatedGroup = await jsonDb.groups.findById(groupId);
            return res.json(populatedGroup);
        }

        const group = await Group.findById(groupId);

        group.members.push({ user: userId, role });

        await group.save();

        res.json(group);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET USER GROUPS
exports.getGroups = async (req, res) => {
    try {
        if (global.useJsonDb) {
            let groups = await jsonDb.groups.find({
                "members.user": req.user.id
            });

            if (groups.length === 0) {
                const defaultGroup = await jsonDb.groups.create({
                    name: "General Workspace",
                    owner: req.user.id,
                    members: [
                        { user: req.user.id, role: "Architect" }
                    ]
                });
                groups = [defaultGroup];
            }
            return res.json(groups);
        }

        let groups = await Group.find({
            "members.user": req.user.id
        }).populate("members.user", "name email");

        if (groups.length === 0) {
            const defaultGroup = new Group({
                name: "General Workspace",
                owner: req.user.id,
                members: [
                    { user: req.user.id, role: "Architect" }
                ]
            });
            await defaultGroup.save();
            const populated = await Group.findById(defaultGroup._id).populate("members.user", "name email");
            groups = [populated];
        }

        res.json(groups);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// REMOVE MEMBER
exports.removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (global.useJsonDb) {
            const group = await jsonDb.groups.findById(groupId);
            if (!group) return res.status(404).json({ message: "Workspace not found" });
            const isOwner = group.owner === req.user.id;
            if (!isOwner) return res.status(403).json({ message: "Only the owner can remove members" });
            group.members = group.members.filter(m => (m.user._id || m.user) !== userId);
            await jsonDb.groups.update(groupId, { members: group.members });
            const updated = await jsonDb.groups.findById(groupId);
            return res.json(updated);
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Workspace not found" });
        if (group.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can remove members" });
        }
        group.members = group.members.filter(m => m.user.toString() !== userId);
        await group.save();
        const populated = await Group.findById(groupId).populate("members.user", "name email");
        res.json(populated);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE MEMBER ROLE
exports.updateMemberRole = async (req, res) => {
    try {
        const { groupId, userId, role } = req.body;

        if (global.useJsonDb) {
            const group = await jsonDb.groups.findById(groupId);
            if (!group) return res.status(404).json({ message: "Workspace not found" });
            const isOwner = group.owner === req.user.id;
            if (!isOwner) return res.status(403).json({ message: "Only the owner can change roles" });
            const member = group.members.find(m => (m.user._id || m.user) === userId);
            if (!member) return res.status(404).json({ message: "Member not found" });
            member.role = role;
            await jsonDb.groups.update(groupId, { members: group.members });
            const updated = await jsonDb.groups.findById(groupId);
            return res.json(updated);
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Workspace not found" });
        if (group.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can change roles" });
        }
        const member = group.members.find(m => m.user.toString() === userId);
        if (!member) return res.status(404).json({ message: "Member not found" });
        member.role = role;
        await group.save();
        const populated = await Group.findById(groupId).populate("members.user", "name email");
        res.json(populated);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};