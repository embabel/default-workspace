---
name: world-status
description: |
  World introspection — list the skills/APIs that are loaded,
  the world path, configuration. Activate ONLY when the user
  explicitly asks about the world itself: "what skills do I
  have", "what's in my world", "show world status",
  "where is my world". Do NOT activate for situational
  questions like "what am I doing" (that's answered from the
  user_context block in the system prompt), nor for capability
  questions like "what can you do" (answer from your identity and
  the personality prompt).
---

# World Status

```ts
gateway.world.status({})
  // → multi-line text: skills loaded, APIs configured, world path
```

That's the whole namespace — single method, no args.

## Pattern

```js
const info = await gateway.world.status({});
await platform.send_message(info);
```

Forward the result string verbatim — it's already formatted for
display.

## When NOT to use this skill

- The user wants to LIST artifacts (apps, diagrams, datasets) →
  `artifacts` skill.
- The user wants to LIST todos → `world-todos` skill.
- The user wants to know ABOUT YOU (identity, name) → just answer from
  the system prompt's "About the user" section, don't call any tool.
