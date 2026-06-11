---
name: documents
description: Search the user's ingested documents / uploaded notes / workspace knowledge base — "search my notes", "what do I have on X", or factual questions answerable from stored content.
---

# Documents (workspace knowledge base)

> **Use `platform.vector_search(query, topK?)`** — there is NO
> `gateway.documents.*`. Documents live in the workspace's RAG store
> and are reached via the platform's vector search.

```ts
platform.vector_search(query: string, topK?: number): Promise<VectorHit[]>
  // → array of { content, score, ...metadata }
```

`topK` defaults to 5. Each hit is a chunk; assemble across chunks if a
single hit doesn't have the full answer.

## Cardinal rules

1. **Search before guessing.** If the user asks about something that
   sounds workspace-specific (a person, a project, a note), search
   first. Don't fall back to "I don't have access to that information"
   without trying.
2. **Phrase the query as a fact-fetch.** Use the user's actual words
   — `vector_search("Alice Agu pets")` works better than
   `vector_search("user info")`.
3. **Synthesise across hits.** Top-K returns chunks; the answer often
   spans several. Concatenate the relevant ones and either summarise
   yourself or hand to `platform.llm` for a one-shot synthesis.
4. **Cite if useful.** Hits carry metadata (URI, source). When the
   answer is fact-shaped, mention where it came from.

## Patterns

```js
// Direct lookup
const hits = await platform.vector_search("Alice Agu pets", 5);
if (hits.length === 0) {
  await platform.send_message("Nothing in your documents about that.");
} else {
  await platform.send_message(hits.map(h => h.content).join("\n\n"));
}

// LLM-summarised
const hits = await platform.vector_search("Alice Agu side project");
const summary = await platform.llm(
  `Based on these notes, answer: what is Alice's side project, what is it called, what language is it in?\n\n${hits.map(h => h.content).join("\n\n")}`,
  { role: "cheap" },
);
await platform.send_message(summary);
```

## When NOT to use this skill

- The user asks about external sources (web, GitHub, arXiv) — use the
  matching gateway / skill instead.
- The user wants to LIST artifacts (apps, diagrams) → `artifacts` skill.
