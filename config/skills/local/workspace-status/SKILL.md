---
name: workspace-status
description: |
  Workspace introspection — list the skills/APIs that are loaded,
  the workspace path, configuration. Activate ONLY when the user
  explicitly asks about the workspace itself: "what skills do I
  have", "what's in my workspace", "show workspace status",
  "where is my workspace". Do NOT activate for situational
  questions like "what am I doing" (that's answered from the
  user_context block in the system prompt), nor for capability
  questions like "what can you do" (answer from your identity and
  the personality prompt).
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
