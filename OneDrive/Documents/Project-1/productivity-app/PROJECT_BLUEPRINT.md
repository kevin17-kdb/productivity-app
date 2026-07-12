# Viora Project Blueprint

Viora is a shared productivity workspace for people who want a simpler, friendlier version of Notion-style planning with Microsoft To Do-style task completion.

## Product Summary

Build a collaborative to-do and tracker website where a workspace can be shared with a group. Each member has a role, tasks can be planned daily, weekly, or monthly, progress is shown clearly, attachments and private notes are supported, mood logs help the admin understand team well-being, and AI gives useful feedback.

## Recommended Role Names

- Architect: full admin access. Can create workspaces, invite members, delete tasks, manage settings, and view allowed team mood logs.
- Planner: moderator access. Can create, assign, edit, and complete tasks, but cannot delete tasks or change Architect-created protected content.
- Contributor: normal person access. Can view tasks and mark tasks completed or incomplete.
- Observer: viewer access. Can only view the workspace.

These names sound more polished than Admin, Moderator, Person, and Viewer while keeping the meaning easy to understand.

## Beginner-Friendly MVP

Build the project in stages. Do not try to finish every advanced feature first.

Stage 1: Core workspace
- Register and login.
- Create a workspace.
- Invite members by email.
- Assign one of four roles.
- Show role badge in the sidebar.

Stage 2: Tasks
- Create daily, weekly, and monthly tasks.
- Daily view uses optional hour rows from 00:00 to 23:00.
- Weekly view uses Sunday to Saturday columns.
- Monthly view uses day 1 to day 31.
- Tasks have title, category, assigned member, deadline, completion status, and attachments.

Stage 3: Permissions
- Architect can do everything.
- Planner can create, assign, and edit tasks, but cannot delete tasks or edit protected Architect tasks.
- Contributor can only complete or uncomplete tasks.
- Observer can only view.

Stage 4: Progress and reports
- Show completion percentage for daily, weekly, and monthly views.
- Less than 40%: red.
- 40% to 70%: orange.
- 70% to 90%: violet.
- Above 90%: blue.
- Show category progress for Studying, Health, Work, Leisure, and General.

Stage 5: Notes and attachments
- Task attachments can be links now. File upload can come later.
- Private task notes are visible only to the person who wrote them.
- Admins should not be able to read private task notes.

Stage 6: Mood space
- A user can log mood, time, and optional reason.
- Architect can view mood logs for workspace members only if the product clearly explains this.
- AI gives supportive, non-medical encouragement.

Stage 7: Reminders
- Browser alarm for deadlines.
- Required reminder: keeps snoozing until task is completed.
- Optional reminder: rings once and asks whether the task is done.
- Phone alarms and push notifications should be a later version because they require mobile app or push notification setup.

Stage 8: Google Calendar
- Let users connect Google Calendar.
- Create calendar events from tasks with deadlines.
- Sync completion status inside Viora.
- Start with one-way export from Viora to Google Calendar before building two-way sync.

## Extra Feature Ideas

- Templates: study timetable, fitness routine, exam prep, team sprint, household chores.
- Recurring tasks: daily water, weekly review, monthly bill.
- Task priority: low, medium, high.
- Focus mode: show only today's assigned tasks.
- Activity log: show who completed, edited, or assigned a task.
- Admin dashboard: overdue tasks, inactive members, category risk areas.
- Gentle AI summaries: "What should I focus on today?" and "Why did this week go badly?"
- Export report: download weekly or monthly progress as PDF later.

## UI Direction

Use a clean productivity interface, not a marketing landing page.

- Left sidebar: profile, navigation, workspaces, invite, theme, logout.
- Main dashboard: workspace header, role badge, quick stats, daily/weekly/monthly tabs.
- Daily view: hour rows from 00:00 to 23:00.
- Weekly view: day columns.
- Monthly view: list or calendar grid.
- Task drawer: task details, attachments, private notes, delete button only for Architect.
- Analytics page: completion rate, category progress bars, AI coach report.
- Mood page: mood input, mood history, admin member selector.

Keep the UI calm, useful, and scannable. Avoid making it look like a decorative landing page.

## Master Prompt For Building The Website

Use this prompt when asking an AI coding assistant to continue building the app:

```text
You are helping me build Viora, a beginner-friendly collaborative productivity web app inspired by Microsoft To Do and Notion, but simpler.

Tech stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB/Mongoose, with current JSON fallback files if needed
- Styling: existing CSS variables in client/src/index.css

Product goal:
Create shared workspaces where 2 or more people can manage daily, weekly, and monthly tasks with role-based permissions, progress tracking, attachments, private notes, reminders, mood logs, and AI reports.

Roles:
- Architect: full admin access
- Planner: can create, assign, edit, and complete tasks, but cannot delete tasks or edit protected Architect-created tasks
- Contributor: can view and mark tasks complete/incomplete
- Observer: can only view

Core task features:
- Daily, weekly, monthly views
- Daily should support optional 00:00 to 23:00 hour rows
- Weekly should support Sunday to Saturday columns
- Monthly should support days 1 to 31
- Task fields: title, type, category, assignedTo, createdBy, completed, date, hourSlot, dayOfWeek, dayOfMonth, deadline, attachments, privateNotes
- Attachments can start as external links
- Private notes must only be visible to the user who wrote them
- Progress colors: <40 red, 40-70 orange, 70-90 violet, >90 blue

AI features:
- AI coach report based on completion and categories
- AI celebration when a workspace view reaches 100%
- Mood support message after mood log
- AI must be supportive and not pretend to be a doctor or therapist

Reminder features:
- Browser-based deadline alarm first
- Required reminder should keep snoozing until complete
- Optional reminder should ring once
- Phone alarm and Google Calendar sync should be later advanced features

UI requirements:
- Build the actual app interface, not a landing page
- Use a left sidebar and focused workspace dashboard
- Use compact panels, tables, rows, tabs, progress bars, and drawers
- Keep cards radius at 8px or less
- Use lucide-react icons where appropriate
- Make it responsive for mobile and desktop
- Avoid huge hero sections, decorative blobs, and one-color purple-only design

Development instructions:
1. First inspect the current files before changing anything.
2. Keep changes small and beginner-readable.
3. Use the current project patterns where possible.
4. Do not remove existing features unless necessary.
5. After coding, run npm build in the client and fix errors.
6. Explain exactly what changed in simple beginner language.
```

## Important Beginner Advice

The hardest parts are phone alarms, Google Calendar sync, file upload, real-time collaboration, and secure private notes. Build the basic web app first, then add those one by one.

For private notes, do not rely only on frontend hiding. The backend must filter private notes so only the owner receives them.

For mood logs, be careful with privacy. Users should clearly know whether the Architect can view a mood entry.

For AI, treat it as a helper, not the main app. The app should still work when AI is unavailable.
