---
name: workspace-todos
description: Workspace todos / tasks — create, list, update, complete, delete. Activate BEFORE any "todo", "task", "remind me", "add to my list", "mark X done", "what TODOs do I have". NOT for external trackers (GitHub, Jira) — use that integration's skill.
---

# Workspace Todos

> **Use `gateway.repository.*` — NOT `gateway.workspace_todos.*`** (the skill name doesn't name the namespace).

The repository is generic across all workspace types (`Todo`, `Cron`,
`TaskQuery`, ...). Type names are **case-sensitive**.

## Methods (all return human-readable STRINGS, not objects)

```ts
gateway.repository.createEntry({ type, data })
  // → "Created Todo with id=abc12345: {id=..., title=..., ...}"

gateway.repository.listEntries({ type, filter? })
  // → "Found 2 Todo entries:\n  1. Call Bob — priority=HIGH, ...\n  2. ..."
  //   or "No Todo entries found." when empty
  // filter syntax: "field~substring" (e.g. "title~Bob")

gateway.repository.updateEntry({ type, id, data })   // returns string
gateway.repository.deleteEntry({ type, id })          // returns string
gateway.repository.describe({ type })                 // returns schema string
```

**Returns are strings — do not access `.data`, `.title`, `.id` etc. on them.**
Forward the string to the user, or extract the id via regex when you need
it for a follow-up call.

## Todo fields

`title` (required), `due` (`"tomorrow"` or ISO), `priority` (`LOW|MEDIUM|HIGH`),
`done` (bool), `tags` (CSV), `notes`. Call `describe({type:"Todo"})` to verify.

## Rules

1. **Always call the gateway.** Never simulate "TODO created" without `createEntry`.
2. **List before update/delete.** User names todos by content; `listEntries({filter:"title~Bob"})` to find the entry, then extract id.
3. **Treat returns as text.** Send the result string to the user — don't try to access fields on it.

## Patterns

```js
// Create — forward the result text
const result = await gateway.repository.createEntry({
  type: "Todo",
  data: { title: "Call Bob", due: "tomorrow", priority: "MEDIUM" },
});
await platform.send_message(result);   // already user-readable

// List — same
const list = await gateway.repository.listEntries({ type: "Todo" });
await platform.send_message(list);

// Mark done — list, extract id with regex, update
const found = await gateway.repository.listEntries({ type: "Todo", filter: "title~Bob" });
const m = found.match(/id=([a-f0-9]+)/);
if (!m) {
  await platform.send_message("No matching todo: " + found);
  return;
}
const result = await gateway.repository.updateEntry({
  type: "Todo", id: m[1], data: { done: true },
});
await platform.send_message(result);
```
