---
name: computation
description: Anything compute-y the user asks — math, data manipulation, hashing, eigenvalues, sorting, "calculate X", "use Python to Y", "run a script that Z", Fibonacci, regex on a string. Activate BEFORE any "calculate", "compute", "what is X mod Y", "hash", "eigenvalues", "Fibonacci", "Python", "run a script", "execute code".
---

# Computation

> **Your script IS the sandbox.** You're already in Node.js — write
> JavaScript that does the computation, then surface the result via
> `platform.send_message`. There is no separate "Python sandbox" or
> `execute_python` tool exposed to you.

For things JS does well (arithmetic, strings, arrays, regex, JSON,
hashing, dates, sorting), just use the standard library:

```js
const crypto = require("crypto");
const hash = crypto.createHash("sha256").update("hello world").digest("hex");
await platform.send_message("SHA-256 of 'hello world': `" + hash + "`");
```

Available built-ins in the sandbox: `crypto`, `fs`, `path`, `url`,
`util`, `zlib`, plus `fetch` (for HTTP). **Use `require(...)`** —
ES-module `import` is not enabled.

## When the answer needs Python-only libraries

If the user explicitly asks for numpy / pandas / matplotlib / sklearn
output, you have two options:

1. **Translate to JS** when the math is small (eigenvalues of a 2×2,
   Fibonacci, basic stats). Most "use Python" requests are about
   getting a result, not about Python per se.
2. **Use `platform.llm`** with `role: "code"` to get a numerical
   answer — call it like a smart calculator. NOT a real interpreter
   but adequate for one-shot results:

   ```js
   const answer = await platform.llm(
     "Compute the eigenvalues of [[1,2],[3,4]] and return ONLY the two numbers as JSON array.",
     { role: "code", system: "Output exactly one JSON array, nothing else." },
   );
   await platform.send_message("Eigenvalues: " + answer);
   ```

3. **Tell the user honestly** if the request needs heavy Python
   tooling (matplotlib plots, scipy, sklearn) that JS can't match —
   don't fake it with `child_process.exec("python ...")` or
   `platform.llm_object` with a `code` role; both fail.

## Rules

1. **Don't `import { x } from "y"`.** Use `const x = require("y")`.
2. **Don't `child_process.exec("python3 ...")`.** Python isn't in the
   sandbox PATH from your script's perspective.
3. **Show the numerical result.** "I'll compute this" with no answer
   afterwards is a UX failure — always close with the value.
