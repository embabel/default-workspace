# Actions

Action specs that define agent behaviours. Each `.yml` file contains a single action definition with an LLM prompt, input/output types, and optional tool references.

Actions are created via the Action Compiler in the UI or by adding files here directly.

```yml
name: summarize-order
description: Summarize an order and extract key fields
inputTypeNames:
  - OrderEvent
outputTypeName: OrderSummary
prompt: |
  Given the following order event:
  {{ orderEvent }}
  Summarize the order details.
tools:
  - fetch
```
