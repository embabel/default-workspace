---
name: vibe-coder
description: Build a single-page HTML app — dashboard, viewer, tracker, mini-app, "thing that shows" something. NOT diagrams (use `diagrams`) or plain text/markdown replies.
---

# Vibe Coder (HTML App Builder)

You build the app YOURSELF and submit it. There is no "app builder tool" that
writes the HTML for you — **you** are the coder. Two tools:

1. **`vibe_app_brief({ request })`** → returns this world's app-building brief:
   the conventions (single self-contained `.html`, backend calls via the typed
   `gateway.*` surface — never a direct external `fetch`), the theme, the existing
   apps, and the typed tool surface. Read it, then write the complete single-file
   HTML against it.
2. **`vibe_app_save({ name, html })`** → validates your HTML (no external fetch,
   escaped output, banner, etc.), serves it at `/apps/<name>`, and returns the URL.
   On rejection it returns the violations — fix them and call again.

```ts
vibe_app_brief({ request: string })           // → the brief (string)
vibe_app_save({ name: string, html: string }) // → { status, name, url } | { status:"rejected", violations }
```

## Method

```
1. vibe_app_brief({ request: "<the user's request, verbatim>" })
2. Read the brief. It hands you the typed gateway surface and the conventions.
3. Write the COMPLETE single-file HTML. The app fetches its OWN data at runtime
   through gateway.* — do NOT pre-fetch data and bake it in.
4. TEST the data calls you plan to embed (run each gateway.kg.query / gateway.*
   call once against the live world and confirm the shape) BEFORE saving.
5. vibe_app_save({ name: "<name>.html", html: "<the full HTML>" }).
6. If rejected, fix the reported violations and call vibe_app_save again.
```

## Cardinal rules

1. **You write the HTML.** There is no `htmlCoder` and nothing else authors the
   app for you. `vibe_app_brief` gives you the brief; you produce the HTML.
2. **Don't pre-fetch data.** If the user says "an app that shows my ratings," the
   app calls `gateway.*` at load time — don't fetch the ratings yourself and paste
   them in. The brief's dynamic-app rule is mandatory.
3. **Backend calls go through `gateway.*`, never a direct external `fetch`.** The
   validator rejects direct external fetches.
4. **Test before you save.** A `gateway.kg.query` you never ran is a runtime error
   the user hits with no way to repair it. Run your queries first; if the data you
   expect isn't in a repository collection, it may be knowledge-graph data — reach
   it with `gateway.kg.query` / `gateway.kg.ask`, not `list_entries`.
5. **Surface the result.** `vibe_app_save` returns the `/apps/<name>` URL — give it
   to the user.

## When to use it (vs alternatives)

- "Make me an app for X" → **vibe-coder** (this skill)
- "Show me X" as a quick table/list → just query and reply; no app needed
- "Make a flowchart / sequence diagram" → **diagrams** skill
- "Edit my existing app" → `vibe_app_brief` names the existing apps; re-author and
  `vibe_app_save` under the same name to replace it
