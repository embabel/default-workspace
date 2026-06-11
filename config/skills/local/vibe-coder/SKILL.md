---
name: vibe-coder
description: Build a single-page HTML app — dashboard, viewer, tracker, mini-app, "thing that shows" something. NOT diagrams (use `diagrams`) or plain text/markdown replies.
---

# Vibe Coder (HTML App Builder)

> **Use `gateway.htmlCoder.htmlCoder({ request })`** — the namespace is
> `htmlCoder`, the entry-point method is also named `htmlCoder`. The
> other 8 methods on this namespace are the inner agent's helpers, not
> for you.

The vibe coder runs its OWN inner LLM loop that:
- Reads the user's request
- Discovers the relevant workspace tools (via `toolSummary` / `listFiles`)
- Generates the HTML
- Bakes the data into the page
- Saves the artifact (renders at `/apps/{name}.html`)

You just call `htmlCoder({ request })` with the user's brief in plain
English. The inner loop handles the rest.

## Method

```ts
gateway.htmlCoder.htmlCoder({ request: string })
  // → returns a string describing what was built (filename, URL, summary)
```

## Cardinal rules

1. **Don't pre-fetch data.** If the user says "make me an app that
   shows xkcd plus github issues", call `htmlCoder({ request: "..." })`
   with that prompt — do NOT first fetch xkcd / issues yourself in JS
   and pass them in. The vibe coder fetches its own data via gateway.
2. **Don't write HTML yourself.** No `gateway.artifacts.writeArtifact({type:"apps"})`
   for new app creation — it bypasses the app builder pipeline. Use
   vibe-coder for new apps; use `writeArtifact` only for surgical edits
   to an existing app.
3. **Pass the user's intent verbatim.** Quoting the user's actual words
   in `request` is fine — the inner loop is good at interpreting them.
4. **Surface the result.** The return value is human-readable; forward
   it to the user (it includes the `/apps/{filename}` URL).

## Pattern

```js
await platform.send_message("Building your app — this can take a moment...");
const result = await gateway.htmlCoder.htmlCoder({
  request: "Make me a dashboard called 'issue-tracker' that lists open issues from embabel/embabel-agent with author and label.",
});
await platform.send_message(result);
```

## When to use it (vs alternatives)

- "Make me an app for X" → **vibe-coder** (this skill)
- "Show me X" as a markdown table or list → just write JS that fetches and `send_message`s
- "Make a flowchart / sequence diagram" → **diagrams** skill (`gateway.save.diagram`)
- "Edit my existing app's title" → `gateway.artifacts.writeArtifact` (surgical edit)
