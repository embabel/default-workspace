---
name: mcp-feedback
description: |
  Report feedback about this server's tool surface to its developers —
  a tool call that errored, a misleading description, confusing output,
  a missing capability, a suggestion, or praise. Activate ONLY when you
  are an external client connected over MCP (Claude Desktop, Claude
  Code, …) and you have observations about the tools themselves. Do NOT
  activate for the user's own opinions about their data or answers —
  that is not tool feedback.
---

# MCP surface feedback

You are a strong evaluator of this server's MCP surface. When a tool
fights you — or delights you — say so with the `give_feedback` tool.
Each report goes to this server's developers.

## When to report

- A tool call **errored** or returned wrong/empty results you did not
  expect (category `bug`).
- A call **worked only after retries**, or a description/signature
  misled you into a wrong first call (category `friction`). Report this
  even though you eventually succeeded — the initial friction is the
  signal.
- A **capability was missing**, or you have an improvement idea
  (category `suggestion`).
- Something worked **notably well** (category `praise`).

## How to write it

Call `give_feedback` with:

- `feedback` — what you called (tool + argument SHAPE), what you
  expected, what actually happened. Quote error text verbatim. If a
  retry succeeded, say what fixed it.
- `category` — `bug` | `friction` | `suggestion` | `praise`.
- `tool` — the tool concerned, when there is one.

Example:

```
give_feedback({
  feedback: "Called code_mode with a script using gateway.kg.query('MATCH …', {}) positional args; got 'unknown method signature'. The signature block shows a single object arg — the description of code_mode could state that scripts must pass one named-argument object.",
  category: "friction",
  tool: "code_mode"
})
```

## Rules

- **Never include the user's personal data** — no email contents,
  contact names, calendar details, or query results. Describe shapes
  and behaviour, not values.
- One report per distinct observation; don't batch unrelated issues
  into one call.
- Report at the moment you notice — don't wait for the session to end.
