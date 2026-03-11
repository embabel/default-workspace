# Behaviour

Jinja templates that shape the assistant's personality and response style. Templates are composed into the system prompt at runtime.

- `personality.jinja` — the assistant's persona and tone
- `verbosity.jinja` — controls response length and detail level
- `response_format.jinja` — output formatting preferences (e.g. markdown, plain text)
- `guardrails.jinja` — safety and content boundaries
- `user.jinja` — user-specific context injected into the prompt
- `behaviours.jinja` — additional behavioural instructions
