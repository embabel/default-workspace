---
name: automation-ui-redirect
description: |
  Activate this skill ONLY when the user is asking about workspace
  AUTOMATION OBJECTS — i.e. literally one of: a SLASH COMMAND ("/foo"
  or "create a command called X"), a CRON / SCHEDULED JOB, an AGENT
  SKILL, an API INTEGRATION, or an MCP SERVER. These five things live
  in Settings → Automations, never in chat.

  DO NOT activate this skill for ordinary user data or content — todos,
  tasks, notes, contacts, calendar events, alerts, documents, diagrams,
  apps, **issues, bugs, tickets, ideas, captures**. Those have their
  own tools (`repository`, `save_diagram`, `documents`, `html_coder`,
  github / linear / jira via `gateway.*`, etc.) and the assistant
  SHOULD just call them directly. "Create three todos" is NOT an
  automation request — it's a normal repository call. "File a GitHub
  issue", "open a bug in Linear", "capture this idea as an issue" are
  NOT automation requests — if an integration provides an issue-create
  tool, USE IT; otherwise add the item to the user's repository (e.g.
  as a `Todo` or `Idea`). Never redirect the user to Settings →
  Automations to "create an issue-creating workflow" — that is the
  exact failure mode this rule exists to prevent.

  The rule of thumb: this skill is about CONFIGURING the assistant's
  behaviour (commands, schedules, integrations). It is NOT about
  CONTENT the user wants captured, filed, or recorded. If the user is
  giving you a payload to store, route, or send — that is a tool
  call, not a UI redirect.

  Trigger phrases that DO match: "create a /X command", "schedule a
  cron job", "install the X skill", "add the X API integration",
  "search for MCP servers", "set up an MCP".
  Trigger phrases that DO NOT match: "create a todo", "schedule a
  meeting" (calendar event, not cron), "install <a python package>",
  "make me an app", "draw a diagram", "add Bob as a contact",
  "create an issue", "file a bug", "open a ticket", "capture this
  idea", "log this as a todo".
---

# Automation / Integration UI Redirect

These workspace capabilities are configured in the **UI**, never in
chat:

- slash commands (`/foo`)
- scheduled / cron jobs
- agent skills
- API integrations
- MCP servers / MCP tools

You do NOT have a tool for any of these. Your ONLY correct response is
**one short sentence** pointing the user to:

- **Settings → Automations** (web UI), or
- **Discover / Automations tab** (TUI).

## Hard rules

DO NOT, under any circumstances:

- Write example code or scripts that pretend to do the install.
- Give step-by-step instructions to install via terminal / git / docker.
- Offer to "draft" or "outline" the command / skill / integration for them.
- Claim you have created / installed / scheduled anything.

Even one sentence like *"here's an example of what the command would
do"* is wrong — it tempts the user to copy-paste it and bypass the UI's
safety net.

## Examples

User: *"Create a slash command called /giggle that tells jokes."*
You: *"Slash commands are set up in the UI — open Settings → Automations
and add a Command trigger there."*

User: *"Install the github-helper skill."*
You: *"Skills are installed via the Discover tab in Settings →
Automations — you'll find github-helper there."*

User: *"Find me an MCP server for Postgres."*
You: *"MCP servers are browsed and installed from Settings → Automations
(Discover tab) — search for Postgres there."*

User: *"Schedule a cron job at 9am every day called morning-ping."*
You: *"Scheduled jobs (cron triggers) are configured in Settings →
Automations — open the Cron tab and add `morning-ping` there."*

That's it. Stay on-message: **point to the UI, full stop.**
