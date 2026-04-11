# Cron

Scheduled jobs that fire events on a cron schedule. Each `.yml` file defines a single job that triggers a workspace action.

```yml
name: ping
cron: "*/90 * * * * *"
description: "Say hello in chat"
actionName: cron-ping
```

The cron expression follows Spring's six-field format: `second minute hour day-of-month month day-of-week`.
