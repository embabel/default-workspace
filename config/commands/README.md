# Commands

Slash command mappings that bind chat commands to world actions. Each `.yml` file defines a single command.

When a user types `/joke cats`, the assistant looks up the command, finds the mapped action, and executes it via ActionInvoker. If no argument is provided, a form is shown to collect input.

```yml
command: joke
actionName: joke
description: "Tell a joke about a subject"
```
