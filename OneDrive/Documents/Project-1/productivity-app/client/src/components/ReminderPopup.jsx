import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Bell, BellOff, AlertTriangle } from "lucide-react";

const ALARM_AUDIO_URL = "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";

export const ReminderPopup = () => {
  const { getDueReminders, snoozeReminder, completeReminder, currentWorkspace } = useApp();
  const [dueReminders, setDueReminders] = useState([]);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(ALARM_AUDIO_URL);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;
    const checkDue = async () => {
      const due = await getDueReminders();
      if (due.length > 0) {
        setDueReminders((prev) => {
          const existingIds = prev.map((r) => r._id);
          const newOnes = due.filter((r) => !existingIds.includes(r._id));
          return [...prev, ...newOnes];
        });
      }
    };
    checkDue();
    const interval = setInterval(checkDue, 15000);
    return () => clearInterval(interval);
  }, [currentWorkspace]);

  useEffect(() => {
    if (dueReminders.length > 0 && !currentReminder) {
      setCurrentReminder(dueReminders[0]);
      playAlarm();
      sendBrowserNotification(dueReminders[0]);
    }
  }, [dueReminders, currentReminder]);

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const sendBrowserNotification = (reminder) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Viora Reminder", {
        body: reminder.title,
        icon: "/vite.svg",
        requireInteraction: true,
      });
    }
  };

  const requestNotifPermission = async () => {
    if (typeof Notification !== "undefined") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  };

  const handleComplete = async () => {
    if (!currentReminder || processing) return;
    setProcessing(true);
    try {
      await completeReminder(currentReminder._id);
      stopAlarm();
      setDueReminders((prev) => prev.filter((r) => r._id !== currentReminder._id));
      setCurrentReminder(null);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSnooze = async () => {
    if (!currentReminder || processing) return;
    setProcessing(true);
    try {
      await snoozeReminder(currentReminder._id);
      stopAlarm();
      setDueReminders((prev) => prev.filter((r) => r._id !== currentReminder._id));
      setCurrentReminder(null);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const isRequired = currentReminder?.type === "required";

  if (!currentReminder) return null;

  return (
    <>
      {/* Notification permission banner */}
      {notifPermission === "default" && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 10000,
            background: "var(--bg-panel)",
            border: "1px solid var(--border-glass)",
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backdropFilter: "var(--glass-blur)",
          }}
        >
          <Bell size={16} color="var(--color-primary)" />
          <span style={{ fontSize: "0.85rem", flex: 1 }}>Enable browser notifications for reminders?</span>
          <button className="btn btn-primary" onClick={requestNotifPermission} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
            Allow
          </button>
          <button
            onClick={() => setNotifPermission("denied")}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <BellOff size={14} />
          </button>
        </div>
      )}

      {/* Alarm popup */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isRequired ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)",
          backdropFilter: "blur(8px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="glass-panel animate-slide-in"
          style={{
            width: "400px",
            maxWidth: "92vw",
            padding: "32px",
            background: "var(--bg-app)",
            border: `2px solid ${isRequired ? "#ef4444" : "var(--color-primary)"}`,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div
            className="animate-shake"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: isRequired ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isRequired ? <AlertTriangle size={32} color="#ef4444" /> : <Bell size={32} color="var(--color-primary)" />}
          </div>

          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: isRequired ? "#ef4444" : "var(--color-primary)" }}>
            {isRequired ? "Required Reminder" : "Reminder"}
          </h2>

          <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{currentReminder.title}</p>

          {isRequired && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              This reminder will keep ringing until marked complete.
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
            <button
              className="btn btn-secondary"
              onClick={handleSnooze}
              disabled={processing}
              style={{ flex: 1, padding: "12px" }}
            >
              {processing ? "..." : isRequired ? "Snooze 5m" : "Dismiss"}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={processing}
              style={{ flex: 1, padding: "12px", background: isRequired ? "#ef4444" : undefined }}
            >
              {processing ? "..." : "Done!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
