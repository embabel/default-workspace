# APIs

OpenAPI definitions for external services the assistant can call. All `.yml` files in this directory are loaded. Each file contains a list of API entries.

```yml
- url: https://api.example.com/openapi.json
  auth: bearer
  token-env: EXAMPLE_API_TOKEN

- url: https://petstore.swagger.io/v2/swagger.json
  auth: none
```

Auth types: `none`, `bearer`, `api-key`. Use `token-env` to reference an environment variable or workspace secret for the credential value.
