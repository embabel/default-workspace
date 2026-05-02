---
name: diagrams
description: Render diagrams (Mermaid, graphviz, plantuml, SVG). Activate BEFORE any "diagram", "flowchart", "sequence diagram", "class diagram", "ER diagram", "mindmap", "architecture diagram". NEVER paste diagram source inline — render it.
---

# Diagrams

> **Use `gateway.save.diagram` — NOT `gateway.diagrams.*`.**

```ts
gateway.save.diagram({ name, content })   // returns the rendered URL
```

`name` extension picks the renderer:
- `.mmd` Mermaid (preferred — best support)
- `.dot` Graphviz · `.puml` PlantUML · `.svg` raw SVG

## Rules

1. **Render, don't paste.** Inline ` ```mermaid ... ``` ` is not a diagram.
2. **Share the link.** Surface `/diagrams/{name}` so the user can click.
3. **Reusing a name overwrites.** Bump to `-v2.mmd` to keep prior versions.

## Pattern

```js
const url = await gateway.save.diagram({
  name: "auth-flow.mmd",
  content: [
    "sequenceDiagram",
    "  participant U as User",
    "  participant A as Auth",
    "  U->>A: credentials",
    "  A-->>U: token",
  ].join("\n"),
});
await platform.send_message("Done — open the diagram at " + url);
```
