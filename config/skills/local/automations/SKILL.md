---
name: automations
description: Things that run automatically — webhook actions (on external event) and cron jobs (on schedule). Activate BEFORE "when X happens, do Y", "every weekday at 9am", "on every PR", "set up an automation", "run this daily", "configure a webhook".
---

# Automations

Two flavours by trigger shape:

- **Webhook** — on external event arrival → `gateway.webhooks.*`
- **Cron** — on schedule → `gateway.repository.createEntry({type:"Cron", ...})` (uses the same repository as todos — see `workspace-todos`)

## Webhooks

```ts
gateway.webhooks.listWebhookSources({})        // sources + URL patterns
gateway.webhooks.suggestWebhooks({})           // suggestions from installed APIs
gateway.webhooks.compileWebhookAction({ source, description, tools })
```

`description` is plain English. `tools` is a comma-separated list of
gateway namespaces the action may use (e.g. `"gateway.gh, gateway.alerts"`).

## Cron

```js
await gateway.repository.createEntry({
  type: "Cron",
  data: {
    name: "morning-digest",
    schedule: "0 9 * * 1-5",   // standard cron: min hr dom mon dow
    description: "Summarise overnight GitHub activity into alerts",
  },
});
```

Verify fields with `gateway.repository.describe({type:"Cron"})` if the
schema differs in your version.

## Rules

1. **Webhook = event, cron = schedule.** Pick by trigger shape.
2. **Don't simulate.** No `createEntry`/`compileWebhookAction` call → no automation runs.
3. **Confirm what was wired.** Surface the cron `name` or webhook `source` after creating so the user can audit.
4. **Empty source list?** Tell the user the registration URL pattern from `listWebhookSources` — never wire an action against a source that's never fired.
