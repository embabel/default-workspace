---
name: workspace-status
description: Workspace introspection — what skills/APIs are loaded, the workspace path, configuration. Activate BEFORE "what skills do I have", "what's in my workspace", "show workspace status", "where is my workspace", "what tools are available", "what can you do".
---

# Workspace Status

```ts
gateway.workspace.status({})
  // → multi-line text: skills loaded, APIs configured, workspace path
```

That's the whole namespace — single method, no args.

## Pattern

```js
const info = await gateway.workspace.status({});
await platform.send_message(info);
```

Forward the result string verbatim — it's already formatted for
display.

## When NOT to use this skill

- The user wants to LIST artifacts (apps, diagrams, datasets) →
  `artifacts` skill.
- The user wants to LIST todos → `workspace-todos` skill.
- The user wants to know ABOUT YOU (identity, name) → just answer from
  the system prompt's "About the user" section, don't call any tool.
