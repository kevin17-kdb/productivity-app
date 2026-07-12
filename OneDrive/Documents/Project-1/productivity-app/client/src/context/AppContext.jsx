import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AppContext = createContext();

const API_BASE = "/api";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [theme, setTheme] = useState(localStorage.getItem("viora-theme") || "aurora");
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [workLog, setWorkLog] = useState(null);
  const [workLogHistory, setWorkLogHistory] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("viora-theme", theme);
  }, [theme]);

  // Set default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      localStorage.setItem("token", token);
      
      // Decode user from JWT or fetch user details
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Simple client-side token expiration check
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Token is valid
          fetchInitialData();
        }
      } catch (e) {
        logout();
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setLoading(false);
    }
  }, [token]);

  const setThemeByName = (name) => {
    setTheme(name);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch workspaces
      const wsResponse = await axios.get(`${API_BASE}/groups`);
      setWorkspaces(wsResponse.data);

      // Load saved workspace or default to first
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
      const savedWorkspace = wsResponse.data.find(w => w._id === savedWorkspaceId);

      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace);
      } else if (wsResponse.data.length > 0) {
        setCurrentWorkspace(wsResponse.data[0]);
        localStorage.setItem("currentWorkspaceId", wsResponse.data[0]._id);
      }

      // Fetch user profile from token data or local storage
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Error fetching initial workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for the current workspace
  const fetchTasks = async (type = "", date = "") => {
    if (!currentWorkspace) return;
    try {
      let url = `${API_BASE}/tasks?workspaceId=${currentWorkspace._id}`;
      if (type) url += `&type=${type}`;
      if (date) url += `&date=${date}`;
      
      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Fetch Analytics & Coach Report
  const fetchAnalytics = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await axios.get(`${API_BASE}/ai/analytics?workspaceId=${currentWorkspace._id}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  // Fetch mood logs
  const fetchMoodLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/moods/me`);
      setMoodLogs(res.data);
    } catch (err) {
      console.error("Error fetching mood logs:", err);
    }
  };

  // Switch Active Workspace
  const selectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem("currentWorkspaceId", workspace._id);
  };

  // --- API Authentication Methods ---
  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem("userData", JSON.stringify(res.data.user));
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await axios.post(`${API_BASE}/auth/signup`, { name, email, password });
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setTasks([]);
    setMoodLogs([]);
    setAnalytics(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("currentWorkspaceId");
  };

  // --- Workspace Actions ---
  const createWorkspace = async (name) => {
    const res = await axios.post(`${API_BASE}/groups`, { name });
    setWorkspaces(prev => [...prev, res.data]);
    if (!currentWorkspace) {
      selectWorkspace(res.data);
    }
    return res.data;
  };

  const addWorkspaceMember = async (userId, role) => {
    if (!currentWorkspace) return;
    const res = await axios.post(`${API_BASE}/groups/member`, {
      groupId: currentWorkspace._id,
      userId,
      role
    });
    const updatedWorkspaces = workspaces.map(w => w._id === currentWorkspace._id ? res.data : w);
    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(res.data);
    return res.data;
  };

  const removeWorkspaceMember = async (userId) => {
    if (!currentWorkspace) return;
    const res = await axios.delete(`${API_BASE}/groups/member`, {
      data: { groupId: currentWorkspace._id, userId }
    });
    const updatedWorkspaces = workspaces.map(w => w._id === currentWorkspace._id ? res.data : w);
    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(res.data);
    return res.data;
  };

  const updateMemberRole = async (userId, role) => {
    if (!currentWorkspace) return;
    const res = await axios.put(`${API_BASE}/groups/member/role`, {
      groupId: currentWorkspace._id,
      userId,
      role
    });
    const updatedWorkspaces = workspaces.map(w => w._id === currentWorkspace._id ? res.data : w);
    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(res.data);
    return res.data;
  };

  // --- Task Actions ---
  const createTask = async (taskData) => {
    if (!currentWorkspace) return;
    const res = await axios.post(`${API_BASE}/tasks`, {
      ...taskData,
      workspace: currentWorkspace._id
    });
    setTasks(prev => [...prev, res.data]);
    fetchAnalytics(); // Refresh analytics
    return res.data;
  };

  const updateTask = async (taskId, updatedData) => {
    const res = await axios.patch(`${API_BASE}/tasks/${taskId}`, updatedData);
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...res.data } : t));
    fetchAnalytics();
    return res.data;
  };

  const toggleTaskComplete = async (taskId) => {
    const res = await axios.patch(`${API_BASE}/tasks/${taskId}/complete`);
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: res.data.completed } : t));
    fetchAnalytics();
    return res.data;
  };

  const setTaskCompleted = async (taskId, completed) => {
    const res = await axios.patch(`${API_BASE}/tasks/${taskId}/complete`, { completed });
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...res.data } : t));
    fetchAnalytics();
    return res.data;
  };

  const deleteTask = async (taskId) => {
    await axios.delete(`${API_BASE}/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t._id !== taskId));
    fetchAnalytics();
  };

  const addTaskAttachment = async (taskId, fileName, url) => {
    const res = await axios.post(`${API_BASE}/tasks/${taskId}/attachments`, { fileName, url });
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, attachments: res.data.attachments } : t));
    return res.data;
  };

  const saveTaskPrivateNote = async (taskId, content) => {
    const res = await axios.post(`${API_BASE}/tasks/${taskId}/private-note`, { content });
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, privateNotes: res.data.privateNotes } : t));
    return res.data;
  };

  // --- Mood Logging Actions ---
  const addMoodLog = async (score, reason) => {
    const res = await axios.post(`${API_BASE}/moods`, { score, reason });
    setMoodLogs(prev => [res.data, ...prev]);
    return res.data;
  };

  // --- Work Log Actions ---
  const fetchWorkLog = async (date, userId) => {
    if (!currentWorkspace) return;
    try {
      let url = `${API_BASE}/worklog?workspace=${currentWorkspace._id}&date=${date}`;
      if (userId) url += `&userId=${userId}`;
      const res = await axios.get(url);
      setWorkLog(res.data);
    } catch (err) {
      console.error("Error fetching work log:", err);
      setWorkLog({ entries: [], reflection: "" });
    }
  };

  const addWorkLogEntry = async (date, content, taggedTask) => {
    if (!currentWorkspace) return;
    const res = await axios.post(`${API_BASE}/worklog/entry`, {
      workspace: currentWorkspace._id,
      date,
      content,
      taggedTask: taggedTask || null,
    });
    setWorkLog(res.data);
    return res.data;
  };

  const removeWorkLogEntry = async (date, entryIndex) => {
    if (!currentWorkspace) return;
    const res = await axios.delete(`${API_BASE}/worklog/entry`, {
      data: { workspace: currentWorkspace._id, date, entryIndex },
    });
    setWorkLog(res.data);
    return res.data;
  };

  const updateWorkLogReflection = async (date, reflection) => {
    if (!currentWorkspace) return;
    const res = await axios.put(`${API_BASE}/worklog/reflection`, {
      workspace: currentWorkspace._id,
      date,
      reflection,
    });
    setWorkLog(res.data);
    return res.data;
  };

  const fetchWorkLogHistory = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await axios.get(`${API_BASE}/worklog/history?workspace=${currentWorkspace._id}`);
      setWorkLogHistory(res.data);
    } catch (err) {
      console.error("Error fetching work log history:", err);
    }
  };

  // --- Tracker Actions ---
  const fetchTrackers = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await axios.get(`${API_BASE}/trackers?workspace=${currentWorkspace._id}`);
      setTrackers(res.data);
    } catch (err) {
      console.error("Error fetching trackers:", err);
    }
  };

  const createTracker = async (trackerData) => {
    if (!currentWorkspace) return;
    const res = await axios.post(`${API_BASE}/trackers`, {
      ...trackerData,
      workspace: currentWorkspace._id,
    });
    setTrackers((prev) => [...prev, res.data]);
    return res.data;
  };

  const getTrackerEntries = async (trackerId, startDate, endDate) => {
    let url = `${API_BASE}/trackers/${trackerId}/entries?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}`;
    const res = await axios.get(url);
    return res.data;
  };

  const saveTrackerEntry = async (trackerId, date, values) => {
    const res = await axios.post(`${API_BASE}/trackers/${trackerId}/entry`, { date, values });
    setTrackers((prev) => prev.map((t) => (t._id === trackerId ? { ...t, entries: res.data.entries } : t)));
    return res.data;
  };

  const deleteTracker = async (trackerId) => {
    await axios.delete(`${API_BASE}/trackers/${trackerId}`);
    setTrackers((prev) => prev.filter((t) => t._id !== trackerId));
  };

  const getTrackerReport = async (trackerId) => {
    const res = await axios.get(`${API_BASE}/trackers/${trackerId}/report`);
    return res.data;
  };

  // --- Reminder Actions ---
  const fetchReminders = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await axios.get(`${API_BASE}/reminders?workspace=${currentWorkspace._id}`);
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };

  const createReminder = async (reminderData) => {
    if (!currentWorkspace) return;
    const res = await axios.post(`${API_BASE}/reminders`, {
      ...reminderData,
      workspace: currentWorkspace._id,
    });
    setReminders((prev) => [...prev, res.data]);
    return res.data;
  };

  const getDueReminders = async () => {
    if (!currentWorkspace) return [];
    try {
      const res = await axios.get(`${API_BASE}/reminders/due?workspace=${currentWorkspace._id}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching due reminders:", err);
      return [];
    }
  };

  const snoozeReminder = async (reminderId) => {
    const res = await axios.post(`${API_BASE}/reminders/${reminderId}/snooze`);
    if (res.data.completed) {
      setReminders((prev) => prev.filter((r) => r._id !== reminderId));
    }
    return res.data;
  };

  const completeReminder = async (reminderId) => {
    const res = await axios.post(`${API_BASE}/reminders/${reminderId}/complete`);
    setReminders((prev) => prev.filter((r) => r._id !== reminderId));
    return res.data;
  };

  // --- Notes Actions ---
  const fetchNotes = async (tagType) => {
    if (!currentWorkspace) return;
    try {
      let url = `${API_BASE}/notes?workspace=${currentWorkspace._id}`;
      if (tagType) url += `&tagType=${tagType}`;
      const res = await axios.get(url);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const createNote = async (content, tags) => {
    if (!currentWorkspace) return;
    const res = await axios.post(`${API_BASE}/notes`, {
      workspace: currentWorkspace._id,
      content,
      tags: tags || [],
    });
    setNotes((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateNote = async (noteId, content) => {
    const res = await axios.put(`${API_BASE}/notes/${noteId}`, { content });
    setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, content } : n)));
    return res.data;
  };

  const deleteNote = async (noteId) => {
    await axios.delete(`${API_BASE}/notes/${noteId}`);
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
  };

  // Find user's role in the current workspace
  const getCurrentUserRole = () => {
    if (!currentWorkspace || !user) return "Observer";
    const member = currentWorkspace.members.find(m => m.user._id === user._id || m.user === user._id);
    return member ? member.role : "Observer";
  };

  // Auto-refresh tasks when selected workspace changes
  useEffect(() => {
    if (currentWorkspace && token) {
      fetchTasks();
      fetchAnalytics();
      fetchTrackers();
      fetchReminders();
    }
  }, [currentWorkspace, token]);

  return (
    <AppContext.Provider value={{
      user,
      token,
      theme,
      workspaces,
      currentWorkspace,
      tasks,
      moodLogs,
      analytics,
      loading,
      setThemeByName,
      selectWorkspace,
      login,
      signup,
      logout,
      createWorkspace,
      addWorkspaceMember,
      removeWorkspaceMember,
      updateMemberRole,
      fetchTasks,
      createTask,
      updateTask,
      toggleTaskComplete,
      setTaskCompleted,
      deleteTask,
      addTaskAttachment,
      saveTaskPrivateNote,
      addMoodLog,
      fetchMoodLogs,
      fetchAnalytics,
      getCurrentUserRole,
      workLog,
      workLogHistory,
      fetchWorkLog,
      addWorkLogEntry,
      removeWorkLogEntry,
      updateWorkLogReflection,
      fetchWorkLogHistory,
      trackers,
      fetchTrackers,
      createTracker,
      getTrackerEntries,
      saveTrackerEntry,
      deleteTracker,
      getTrackerReport,
      reminders,
      fetchReminders,
      createReminder,
      getDueReminders,
      snoozeReminder,
      completeReminder,
      notes,
      fetchNotes,
      createNote,
      updateNote,
      deleteNote
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
