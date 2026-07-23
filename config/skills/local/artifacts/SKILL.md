---
name: artifacts
description: World artifacts — saved generated files (apps, code, datasets, diagrams). For "show my apps", "list diagrams", "delete the X file", "open my dataset", or referencing a generated artifact by name. NOT the JS/Python sandbox's own filesystem (`/world/scripts`) — use `fs` / `bash_run("ls ...")` inside execute_* for that.
---

# Artifacts (world-saved files)

> **Use `gateway.artifacts.*`.** Types are `apps`, `code`, `datasets`,
> `diagrams` (lowercase; matches `/{type}/{name}` URLs).

```ts
gateway.artifacts.listArtifacts({})            // → STRING (markdown sections per type)
gateway.artifacts.readArtifact({ type, name }) // → STRING (file contents)
gateway.artifacts.writeArtifact({ type, name, content })
gateway.artifacts.deleteArtifact({ type, name })
```

**Cardinal rule:** `listArtifacts`, `readArtifact`, `writeArtifact`, and
`deleteArtifact` ALL return formatted **strings**, not objects. Do NOT
do `.map(...)` or `.artifacts` or destructure them. Surface the string
to the user (or pass it to `platform.llm` for paraphrasing).

## When this skill is the WRONG one

- "List the files in the home directory of the sandbox" → use Node
  `fs.readdirSync(...)` or `bash_run("ls -la ~")`. The sandbox's own
  filesystem (where your script runs) is **not** world artifacts.
- "What's in `/world/...`" → same: sandbox filesystem, not artifacts.
- HTML apps you're CREATING → use vibe-coder (this skill is for editing
  existing ones, not generating new).
- Diagrams you're RENDERING → use `gateway.save.diagram` (the
  `diagrams` skill runs the render pipeline; `writeArtifact({type:"diagrams"})`
  bypasses it).

## Patterns

```js
// List — surface the string straight to the user.
const list = await gateway.artifacts.listArtifacts({});
await platform.send_message(list);

// Read one specific artifact.
const html = await gateway.artifacts.readArtifact({ type: "apps", name: "todo-tracker.html" });
await platform.send_message("```html\n" + html + "\n```");

// Write a dataset.
await gateway.artifacts.writeArtifact({
  type: "datasets",
  name: "issues.json",
  content: JSON.stringify(issues, null, 2),
});
```

## Rules

1. **List before delete.** Confirm the name exists; silent deletes surprise the user.
2. **Don't `.map()` the listing.** It's a string. See "Cardinal rule".
3. **Sandbox files ≠ artifacts.** See "When this skill is the WRONG one".
