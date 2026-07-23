# config/

Everything that defines how the assistant behaves. **A factory reset wipes this
directory and reseeds it from the default-world template.**

Layout:

- `world.yml` — top-level world configuration (LLM choices, etc.)
- `.embabel/prompts/` — chat-system prompt templates
- `behaviour/` — personality, identity, response format, guardrails
- `commands/` — slash commands the user has defined
- `cron/` — scheduled jobs
- `actions/` — compiled action specs
- `goals/` — GOAP goals
- `apis/` — learned API specs
- `mcp/` — MCP server configurations
- `skills/` — skill sources
- `realms.yml` + `realms/` — installed realms
- `webhooks/` — webhook registrations
- `channels/` — output channel configs
- `types/` — dynamic type definitions
- `apps/` — world-level demo apps shipped with the template (read-only;
  user vibe-coded apps go in `data/apps/` and shadow these by name)

If you want to preserve customizations across a reset, edit them in the
default-world template repo instead — those become the new starting point.

User-owned content (documents, vibe-coded apps, tasks, learnings, generated
artifacts) lives in the sibling `data/` directory and is preserved by reset.
