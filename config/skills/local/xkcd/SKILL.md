---
name: xkcd
description: xkcd webcomics — fetch the current comic or a specific one by number (title, image, alt text). Activate for ANY xkcd request — "xkcd", "latest/today's xkcd", "show me an xkcd comic", or a specific xkcd number. There is a dedicated xkcd source — use THIS, never web search.
---

# xkcd

> **Use `gateway.xkcd.*` from `execute_javascript` — do NOT web-search for xkcd. A dedicated source exists.**

```ts
gateway.xkcd.getInfo0Json({})                       // the CURRENT (latest) comic
gateway.xkcd.getByComicIdInfo0Json({ /* id */ })    // a specific comic by number
```

Each returns the comic's metadata: `num`, `title`, `img` (the image URL), `alt`
(hover text), and date fields. Call `describe("xkcd")` for the exact argument shape
of `getByComicIdInfo0Json`.

## Reply

Fetch the comic, then reply with the title and number, the comic image embedded
inline using Markdown image syntax that points at the `img` URL, and the `alt` text
underneath. Embedding the image inline lets the user see it without leaving chat.

```js
const c = await gateway.xkcd.getInfo0Json({});
return c;   // then compose the reply from c.title, c.num, c.img (embed inline), c.alt
```
