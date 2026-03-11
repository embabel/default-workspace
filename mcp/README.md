# MCP Servers

[Model Context Protocol](https://modelcontextprotocol.io/) server configurations. All `.yml` files in this directory are loaded. Each file contains a list of MCP server entries. Tools from connected servers are available to the LLM and the action compiler.

```yml
- name: brave-search
  description: "Web search via Brave Search API"
  command: docker
  args: ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "mcp/brave-search"]
  env:
    BRAVE_API_KEY: ${BRAVE_API_KEY}
```

Environment variable references in `env` values (e.g. `${BRAVE_API_KEY}`) are resolved from system environment variables or workspace secrets.
