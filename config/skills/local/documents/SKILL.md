---
name: documents
description: Search the user's ingested documents / uploaded notes / world knowledge base — "search my notes", "what do I have on X", or factual questions answerable from stored content.
---

# Documents (world knowledge base)

> **If the `reference_docs` tools are in your tool list, USE THOSE — not a
> script.** Call `reference_docs` once to reveal the inner search tools, then
> `reference_docs_vectorSearch({query, topK: 8, threshold: 0.25})` /
> `reference_docs_textSearch({query, topK: 8, threshold: 0.25})`. For a
> question about a FIGURE or chart (a count, value, or label in an image),
> the figure chunk in the search results names an `assess_figure` tool and a
> figureId — call it; never guess a number from a figure's description.

Scripted access (code-act mode, where the `platform` library exists):

```ts
platform.vector_search(query: string, topK?: number): Promise<VectorHit[]>
  // → array of { content, score, ...metadata }
```

There is NO `gateway.documents.*` — do not invent one. In conventional chat,
scripts are the WRONG surface for document search; use the tools above.

`topK` defaults to 5. Each hit is a chunk; assemble across chunks if a
single hit doesn't have the full answer.

## Cardinal rules

1. **Search before guessing.** If the user asks about something that
   sounds world-specific (a person, a project, a note, a term from an
   uploaded spec), search first. Don't fall back to "I don't have access to
   that information" without trying.
2. **Phrase the query as the user's actual question.** The full sentence
   ranks better than a bare keyword. For a definition ("what is X"), ALSO
   run a textSearch on the exact term — glossary lines are keyword hits.
3. **Synthesise across hits.** Top-K returns chunks; the answer often
   spans several. Quote the chunks faithfully.
4. **Cite if useful.** Hits carry metadata (URI, source). When the
   answer is fact-shaped, mention where it came from.

## When NOT to use this skill

- The user asks about external sources (web, GitHub, arXiv) — use the
  matching gateway / skill instead.
- The user wants to LIST artifacts (apps, diagrams) → `artifacts` skill.
- The user wants to EDIT a world note → the living-documents tools.
