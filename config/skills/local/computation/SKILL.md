---
name: computation
description: Anything compute-y the user asks — math, data manipulation, hashing, eigenvalues, sorting, "calculate X", "use Python to Y", "run a script that Z", Fibonacci, regex on a string. Activate BEFORE any "calculate", "compute", "what is X mod Y", "hash", "eigenvalues", "Fibonacci", "Python", "run a script", "execute code".
---

# Computation

You can run code to compute the answer. Two paths depending on which
tools are available to you in this turn:

## Path A — `execute_python` / `execute_javascript` are top-level tools

If you can see `execute_python` or `execute_javascript` in your tool
list, use them directly. They run in a sandboxed interpreter:

- `execute_python` is the right call for numpy / pandas / matplotlib /
  hashlib / `import` style code. Standard Python; `import` works.
- `execute_javascript` is the right call for crypto.subtle, JSON,
  regex, anything quick. Standard Node-ish; `require` works.

Always close with the actual computed value. "I'll compute this" with
no answer is a UX failure.

```python
# execute_python: SHA-256 of "hello world"
import hashlib
print(hashlib.sha256(b"hello world").hexdigest())
```

## Path B — only `gateway.*` and `platform.*` available (CodeAct)

If you don't see `execute_python` / `execute_javascript` in your tool
list, you ARE the script — your reply IS executable JavaScript
running in the sandbox. Use Node built-ins:

```js
const crypto = require("crypto");
const hash = crypto.createHash("sha256").update("hello world").digest("hex");
await platform.send_message("SHA-256: `" + hash + "`");
```

Available built-ins: `crypto`, `fs`, `path`, `url`, `util`, `zlib`,
plus `fetch`. **Use `require(...)`** — `import` is not enabled.

Use `fs.readdirSync(...)` / `bash_run("ls ~")` to inspect the
sandbox's own filesystem (`/world`, home dir, etc.). The
sandbox is YOUR runtime — `gateway.artifacts.*` is for the user's
saved world files, NOT for sandbox-fs inspection.

If the user explicitly asks for Python output and Path B is your only
option, you have THREE choices in order of preference:

### 1. Translate to JS

Fibonacci, eigenvalues of small matrices, basic stats are all easy in
JS. Skip Python entirely:

```js
const fib = [0, 1];
for (let i = 2; i < 10; i++) fib.push(fib[i-1] + fib[i-2]);
await platform.send_message("Fibonacci: " + fib.join(", "));
```

### 2. Write the script, then run it (the "save and run" pattern)

`python3` IS on the sandbox PATH. The reliable pattern is to **write
the script to a file first** and then `execSync` it. Do NOT try to
inline Python via `python3 -c "..."` from JS — the escape rules for
multi-line indented Python through a JS template literal through a
shell argument are a minefield (newlines becoming `;` produce
`SyntaxError`, indented blocks blow up, quoted strings collide).

```js
const fs = require("fs");
const { execSync } = require("child_process");

fs.writeFileSync("/tmp/fib.py", `
a, b = 0, 1
for _ in range(10):
    print(a)
    a, b = b, a + b
`);
const out = execSync("python3 /tmp/fib.py", { encoding: "utf-8" });
await platform.send_message("Fibonacci:\n```\n" + out + "```");
```

If the user said "save it, then run it" — pick a stable name like
`/tmp/<thing>.py` (or `/world/<thing>.py` if they need to find it
later) so the "save" step is real and inspectable.

### 3. Use `platform.llm` for a one-shot numerical answer

LLM-as-calculator. Adequate for "what are the eigenvalues" but NOT a
real interpreter — don't use for anything stateful or multi-step:

```js
const answer = await platform.llm(
  "Compute the eigenvalues of [[1,2],[3,4]] and return ONLY the two numbers as JSON array.",
  { role: "code", system: "Output exactly one JSON array, nothing else." },
);
await platform.send_message("Eigenvalues: " + answer);
```

## Rules (both paths)

1. **Always show the numerical result.** Don't describe what the code
   would do — run it and surface the value.
2. **Save-and-run for Python in Path B.** `python3 -c "..."` with
   multi-line code is a trap (see option 2). Write the file, then exec.
3. **Don't `import { x } from "y"`** in JS — use `const x = require("y")`.
