const Group = require("../models/Group");
const Task = require("../models/Task");
const jsonDb = require("../utils/jsonDb");

/**
 * Middleware to check if a user is a member of the workspace and has one of the allowed roles.
 * Supports:
 * - Detecting workspaceId from query (req.query.workspaceId)
 * - Detecting workspaceId from body (req.body.workspace)
 * - Detecting workspaceId from task ID parameter (req.params.id) for operations on specific tasks
 * 
 * @param {Array<string>} allowedRoles - List of roles permitted to perform this action (e.g. ['Architect', 'Planner'])
 */
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            let workspaceId = req.query.workspaceId || req.body?.workspace;

            // If a task ID parameter is present in the route, look up the task's workspace first
            if (req.params.id) {
                let task;
                if (global.useJsonDb) {
                    task = await jsonDb.tasks.findById(req.params.id);
                } else {
                    task = await Task.findById(req.params.id);
                }

                if (!task) {
                    return res.status(404).json({ message: "Task not found" });
                }
                
                // Get workspace ID from task, supporting JSON strings, ObjectIds, and populated objects.
                const taskWorkspace = task && task.workspace;
                if (!taskWorkspace) {
                    return res.status(400).json({ message: "Task is missing its workspace reference" });
                }
                workspaceId = (typeof taskWorkspace === "object" && taskWorkspace._id ? taskWorkspace._id : taskWorkspace).toString();
                // Attach the task object to req so controllers don't need to query it again
                req.task = task;
            }

            if (!workspaceId) {
                return res.status(400).json({ message: "Workspace ID is required" });
            }

            let group;
            if (global.useJsonDb) {
                group = await jsonDb.groups.findById(workspaceId);
            } else {
                group = await Group.findById(workspaceId);
            }

            if (!group) {
                return res.status(404).json({ message: "Workspace not found" });
            }

            // Find the member record for the logged-in user
            const member = group.members.find((m) => {
                const memberUserId = m.user._id || m.user;
                return memberUserId.toString() === req.user.id.toString();
            });

            if (!member) {
                return res.status(403).json({ message: "Access denied: you are not a member of this workspace" });
            }

            // Verify if the user's role is in the allowed list
            if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
                return res.status(403).json({ 
                    message: `Access denied: role '${member.role}' is not authorized to perform this action.` 
                });
            }

            // Attach workspace and role details to the request object
            req.workspace = group;
            req.userWorkspaceRole = member.role;
            next();

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
};

module.exports = { checkRole };
