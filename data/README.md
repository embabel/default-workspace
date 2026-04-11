# data/

User-owned content. **Everything under `data/` survives a factory reset.**

The rest of the workspace (config files, behaviour, commands, cron jobs, learned APIs,
installed packs, skills, etc.) is "config" — it gets wiped and reseeded from the
default-workspace template when you reset. This directory is not.

Layout:

- `documents/` — living markdown documents you (or the assistant) author
- `apps/` — vibe-coded HTML apps (the assistant writes here)
- `tasks/` — task instances and history
- `learnings/` — accumulated notes and references
- `code/` — generated scripts
- `datasets/` — generated CSV / JSON data files
- `diagrams/` — generated DOT / Mermaid / SVG diagrams
- `*.yml` — dynamic-type repository stores (e.g. `todo.yml`, `task.yml`)

If you want a clean slate, factory reset preserves this directory. If you want
to nuke everything including data, delete the workspace.
