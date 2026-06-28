# Terrain — Project Management Dashboard

A JIRA-style Kanban dashboard with login, task tracking, daily updates, file attachments, and analytics.

## Features

- **Login & accounts** — Sign in or create an account (per-user task boards)
- **Kanban board** — Scheduled → In Progress → Released
- **Dashboard** — Stats, analytics, reminders, team collaboration, time tracker
- **Task details** — DoD checklist, daily updates, linked file uploads
- **Import / export** — Full task timeline report (CSV & JSON)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Demo logins:** `admin` / `admin123` or create your own account.

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to the `main` branch auto-deploy to GitHub Pages via GitHub Actions.
