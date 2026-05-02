---
name: artifacts
description: Workspace artifacts — list/read/write/delete generated files (apps, code, datasets, diagrams). Activate BEFORE "show my apps", "list diagrams", "what artifacts have I created", "delete the X file", "open my dataset", or when the user references a previously generated artifact by name.
---

# Artifacts

> **Use `gateway.artifacts.*`.** Types are `apps`, `code`, `datasets`, `diagrams` (case as listed; matches `/{type}/{name}` URLs).

```ts
gateway.artifacts.listArtifacts({})
gateway.artifacts.readArtifact({ type, name })
gateway.artifacts.writeArtifact({ type, name, content })
gateway.artifacts.deleteArtifact({ type, name })
```

## Rules

1. **Diagrams → use `gateway.save.diagram`** (see `diagrams` skill). It runs the render pipeline. `writeArtifact({type:"diagrams"})` bypasses it.
2. **HTML apps → use vibe-coder.** `writeArtifact({type:"apps"})` is for surgical edits, not new app creation.
3. **List before delete.** Confirm the name exists; silent deletes surprise the user.

## Pattern

```js
const all = await gateway.artifacts.listArtifacts({});
const html = await gateway.artifacts.readArtifact({ type: "apps", name: "todo-tracker.html" });
await gateway.artifacts.writeArtifact({ type: "datasets", name: "issues.json", content: JSON.stringify(issues, null, 2) });
```
