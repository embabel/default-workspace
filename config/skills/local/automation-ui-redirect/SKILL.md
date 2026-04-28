---
name: automation-ui-redirect
description: |
  Activate this skill BEFORE responding when the user asks to create,
  edit, list, install, search-for, or delete any of: a slash command
  (/foo), a scheduled / cron job, an agent skill, an API integration,
  or an MCP server. Trigger phrases include "create a /X command",
  "schedule a job", "install the X skill", "add the X API",
  "search for MCP servers", "install the X MCP", "set up X integration",
  "find me an MCP". These are configured in the UI, not in chat — this
  skill tells you exactly what to say.
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
