import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, CheckSquare, Square, Calendar, Clock, AlertTriangle, User, Paperclip, ShieldCheck, ListChecks, Target, Users, Flag } from "lucide-react";
import { TaskDrawer } from "../components/TaskDrawer";

export const Dashboard = () => {
  const {
    tasks,
    currentWorkspace,
    createTask,
    toggleTaskComplete,
    createReminder,
    getCurrentUserRole
  } = useApp();

  const [activeTab, setActiveTab] = useState("daily");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [hourSlot, setHourSlot] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderType, setReminderType] = useState("required");

  const userRole = getCurrentUserRole();
  const canModify = userRole === "Architect" || userRole === "Planner";
  const canToggleTasks = userRole !== "Observer";

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const taskData = {
        title,
        type: activeTab,
        category,
        priority,
        assignedTo: assignedTo || undefined,
        deadline: deadline ? new Date(deadline) : undefined
      };

      if (activeTab === "daily") {
        taskData.hourSlot = hourSlot;
        taskData.date = new Date();
      } else if (activeTab === "weekly") {
        taskData.dayOfWeek = Number(dayOfWeek);
      } else if (activeTab === "monthly") {
        taskData.dayOfMonth = Number(dayOfMonth);
      }

      const createdTask = await createTask(taskData);

      if (reminderEnabled && deadline) {
        await createReminder({
          title: `Reminder: ${title}`,
          type: reminderType,
          task: createdTask._id,
          triggerTime: new Date(deadline),
        });
      }

      setTitle("");
      setDeadline("");
      setAssignedTo("");
      setReminderEnabled(false);
      setShowAddForm(false);
    } catch (err) {
      alert("Error adding task: " + err.message);
    }
  };

  // Progress Calculations
  const totalTasks = tasks.filter(t => t.type === activeTab).length;
  const completedTasks = tasks.filter(t => t.type === activeTab && t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Progress Color Schemes
  const getProgressColor = (percent) => {
    if (percent < 40) return { name: "Coral Crimson", value: "var(--progress-red)", glow: "var(--progress-red-glow)" };
    if (percent < 70) return { name: "Solar Amber", value: "var(--progress-orange)", glow: "var(--progress-orange-glow)" };
    if (percent < 90) return { name: "Royal Amethyst", value: "var(--progress-violet)", glow: "var(--progress-violet-glow)" };
    return { name: "Cyan Oasis", value: "var(--progress-blue)", glow: "var(--progress-blue-glow)" };
  };

  const progressStyle = getProgressColor(completionPercentage);

  // Group daily tasks hourly
  const hourlySlots = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);

  const daysOfWeekLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const filteredTasks = tasks.filter(t => t.type === activeTab);
  const assignedTasks = filteredTasks.filter(t => t.assignedTo).length;
  const overdueTasks = filteredTasks.filter(t => t.deadline && !t.completed && new Date(t.deadline) < new Date()).length;
  const roleDescriptions = {
    Architect: "Full workspace control",
    Planner: "Can add, assign, and update most tasks",
    Contributor: "Can complete assigned tasks",
    Observer: "View-only access"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "20px" }}>
      
      {/* Workspace Header */}
      <section className="workspace-hero">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={14} /> {userRole} · {roleDescriptions[userRole] || "Workspace member"}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "8px" }}>
            {currentWorkspace ? currentWorkspace.name : "Select a Workspace"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Shared daily, weekly, and monthly planning with clear ownership, progress, notes, and reminders.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span className="badge" style={{ background: canToggleTasks ? "rgba(16, 185, 129, 0.16)" : "var(--bg-input)", color: canToggleTasks ? "#34d399" : "var(--text-muted)" }}>
            {canToggleTasks ? "Completion enabled" : "Read only"}
          </span>
          {canModify && currentWorkspace && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> Add Task
            </button>
          )}
        </div>
      </section>

      <section className="metric-row">
        <div className="metric-tile">
          <ListChecks size={18} />
          <div>
            <span>{totalTasks}</span>
            <p>{activeTab} tasks</p>
          </div>
        </div>
        <div className="metric-tile">
          <Target size={18} />
          <div>
            <span>{completionPercentage}%</span>
            <p>completed</p>
          </div>
        </div>
        <div className="metric-tile">
          <Users size={18} />
          <div>
            <span>{assignedTasks}</span>
            <p>assigned</p>
          </div>
        </div>
        <div className="metric-tile danger">
          <AlertTriangle size={18} />
          <div>
            <span>{overdueTasks}</span>
            <p>overdue</p>
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div className="view-switcher">
        {["daily", "weekly", "monthly"].map(tab => (
          <button 
            key={tab} 
            className={`view-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} List
          </button>
        ))}
      </div>

      {/* Database Lists container */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "16px" }}>
        
        {/* Render Daily (Hourly Structure) */}
        {activeTab === "daily" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {hourlySlots.map(slot => {
              const slotTasks = filteredTasks.filter(t => t.hourSlot === slot);
              return (
                <div key={slot} className="time-row">
                  <div style={{ width: "60px", color: "var(--color-primary)", fontWeight: "bold", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={14} /> {slot}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {slotTasks.map(task => (
                      <TaskCard key={task._id} task={task} onSelect={setSelectedTask} onToggle={toggleTaskComplete} />
                    ))}
                    {slotTasks.length === 0 && (
                      <span style={{ color: "var(--text-subtle)", fontSize: "0.85rem", fontStyle: "italic" }}>No tasks set for this hour</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render Weekly (Day-of-Week Columns) */}
        {activeTab === "weekly" && (
          <div className="dashboard-grid">
            {daysOfWeekLabels.map((day, idx) => {
              const dayTasks = filteredTasks.filter(t => t.dayOfWeek === idx);
              return (
                <div key={day} className="planner-column">
                  <h3 style={{ fontSize: "1rem", color: "var(--color-primary)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>{day}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    {dayTasks.map(task => (
                      <TaskCard key={task._id} task={task} onSelect={setSelectedTask} onToggle={toggleTaskComplete} />
                    ))}
                    {dayTasks.length === 0 && (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", fontSize: "0.85rem" }}>
                        Free day!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render Monthly (Flat board list) */}
        {activeTab === "monthly" && (
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Monthly Board (1st - 31st)</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredTasks.map(task => (
                <div key={task._id} className="glass-panel" style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                    <div style={{ background: "var(--bg-input)", padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "bold" }}>
                      Day {task.dayOfMonth || 1}
                    </div>
                    <TaskCard task={task} onSelect={setSelectedTask} onToggle={toggleTaskComplete} noBorder />
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-subtle)", padding: "20px" }}>No monthly tasks configured.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Color-Coded Progress Footer */}
      {currentWorkspace && totalTasks > 0 && (
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto", borderTop: `2px solid ${progressStyle.value}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", background: progressStyle.value, boxShadow: `0 0 10px ${progressStyle.glow}` }}></span>
              <span style={{ fontWeight: 600 }}>{activeTab.toUpperCase()} PROGRESS: {completionPercentage}%</span>
            </div>
            <span className="badge" style={{ background: progressStyle.value, color: "white", fontSize: "0.8rem", padding: "4px 12px" }}>
              {progressStyle.name} Status
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionPercentage}%`, background: progressStyle.value, boxShadow: `0 0 8px ${progressStyle.glow}` }}></div>
          </div>
        </div>
      )}

      {/* Notion-style Drawer for Task Details */}
      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {showAddForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "420px", padding: "24px", background: "var(--bg-app)" }}>
            <h3 style={{ marginBottom: "16px" }}>Create New Task</h3>
            <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  placeholder="e.g. Study Chemistry Chapter 2" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Studying">Studying</option>
                    <option value="Health">Health</option>
                    <option value="Work">Work</option>
                    <option value="Leisure">Leisure</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {activeTab === "daily" && (
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Hour Slot</label>
                    <select className="input-field" value={hourSlot} onChange={(e) => setHourSlot(e.target.value)}>
                      {hourlySlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                )}

                {activeTab === "weekly" && (
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Day of Week</label>
                    <select className="input-field" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                      {daysOfWeekLabels.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                    </select>
                  </div>
                )}

                {activeTab === "monthly" && (
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Day of Month</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31" 
                      className="input-field" 
                      value={dayOfMonth} 
                      onChange={(e) => setDayOfMonth(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Deadline (Optional - Rings alarm at time)</label>
                <input 
                  type="datetime-local" 
                  className="input-field" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {deadline && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "var(--bg-input)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    Set Reminder
                  </label>
                  {reminderEnabled && (
                    <select
                      className="input-field"
                      value={reminderType}
                      onChange={(e) => setReminderType(e.target.value)}
                      style={{ padding: "4px 8px", fontSize: "0.8rem", width: "140px" }}
                    >
                      <option value="required">Required (snooze until done)</option>
                      <option value="optional">Optional (ring once)</option>
                    </select>
                  )}
                </div>
              )}

              {currentWorkspace && (
                <div className="input-group">
                  <label>Assign Member</label>
                  <select className="input-field" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {currentWorkspace.members.map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Task Card sub-component for cleanly rendering tasks
const TaskCard = ({ task, onSelect, onToggle, noBorder = false }) => {
  const { getCurrentUserRole } = useApp();
  const userRole = getCurrentUserRole();
  const canToggle = userRole !== "Observer";

  const getCatColor = (cat) => {
    const map = {
      Studying: "var(--cat-studying)",
      Health: "var(--cat-health)",
      Work: "var(--cat-work)",
      Leisure: "var(--cat-leisure)",
      General: "var(--cat-general)"
    };
    return map[cat] || "var(--cat-general)";
  };

  return (
    <div 
      className={noBorder ? "" : "glass-panel"} 
      style={{ 
        padding: noBorder ? "0px" : "12px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        width: "100%",
        borderLeft: noBorder ? "none" : `4px solid ${getCatColor(task.category)}`,
        background: noBorder ? "transparent" : "rgba(255,255,255,0.015)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (canToggle) onToggle(task._id);
          }} 
          style={{ background: "none", border: "none", cursor: canToggle ? "pointer" : "default", display: "flex", alignItems: "center" }}
        >
          {task.completed ? (
            <CheckSquare size={18} color="var(--color-primary)" />
          ) : (
            <Square size={18} color="var(--text-muted)" />
          )}
        </button>
        
        <div onClick={() => onSelect(task)} style={{ cursor: "pointer", flex: 1 }}>
          <p style={{ 
            fontWeight: 600, 
            fontSize: "0.95rem", 
            textDecoration: task.completed ? "line-through" : "none",
            color: task.completed ? "var(--text-subtle)" : "var(--text-main)" 
          }}>
            {task.title}
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7rem", color: getCatColor(task.category), fontWeight: "bold" }}>
              {task.category}
            </span>
            {task.priority && task.priority !== "medium" && (
              <span style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "2px",
                color: task.priority === "high" ? "#f87171" : "#34d399",
              }}>
                <Flag size={9} /> {task.priority}
              </span>
            )}
            {task.deadline && (
              <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "2px" }}>
                <Calendar size={10} /> {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
            {task.assignedTo && (
              <span style={{ fontSize: "0.7rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "2px" }}>
                <User size={10} /> {task.assignedTo.name}
              </span>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "2px" }}>
                <Paperclip size={10} /> {task.attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
