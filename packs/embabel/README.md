# GitHub Pack

Analyze, triage, and fix GitHub issues automatically.

## What it does

- **Triage**: Reads a GitHub issue via the API, assesses whether it can be fixed by an AI agent
- **Fix**: Clones the repo in a Docker sandbox, makes changes, pushes a branch, and creates a PR

## Required environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | MCP github tool, sandbox | GitHub API access and `gh` CLI authentication inside the sandbox |
| `ANTHROPIC_API_KEY` | sandbox | Claude Code API calls inside the Docker sandbox |

### Setting up

```bash
# Option 1: Use a GitHub PAT
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...

# Option 2: Use the gh CLI's token
export GITHUB_PERSONAL_ACCESS_TOKEN=$(gh auth token)

# Anthropic key (required for Claude Code in sandbox)
export ANTHROPIC_API_KEY=sk-ant-...
```

## Commands

| Command | Description |
|---|---|
| `/fix-issue owner/repo#number` | Triage and fix a GitHub issue |

## Actions

| Action | Input | Output | Executor |
|---|---|---|---|
| `triage-github-issue` | `GitHubIssue` | `TriagedIssue` | LLM |
| `fix-github-issue` | `TriagedIssue` | `BackgroundMessage` | Claude Code (Docker sandbox) |

## Types

- **GitHubIssue**: `owner`, `repo`, `issue`
- **TriagedIssue**: `owner`, `repo`, `issue`, `title`, `body`, `labels`, `assessment`, `repoPath`

## MCP Servers

- **github**: GitHub API via `ghcr.io/github/github-mcp-server` (requires `GITHUB_PERSONAL_ACCESS_TOKEN`)

## Safety

The `fix-github-issue` action runs with `sandbox.enabled: true`. It will **never** run unsandboxed. If Docker is unavailable, the action is denied rather than falling back to host execution.
