---
name: package-search
description: Search Unity's package registry plus locally installed packages (Git, local, embedded sources) by query string. Returns available versions and installation status. Online mode fetches exact matches from the live registry then supplements with cached substring matches.
metadata:
  generated-by: mcp-plugin-dotnet
---

# Package Manager / Search

Search for packages in both Unity Package Manager registry and installed packages. Use this to find packages by name before installing them. Returns available versions and installation status. Searches both the Unity registry and locally installed packages (including Git, local, and embedded sources). Results are prioritized: exact name match, exact display name match, name substring, display name substring, description substring. Note: Online mode fetches exact matches from live registry, then supplements with cached substring matches.

## Inputs

- `query` — package id, name, display name, or description keyword (case-insensitive). Required.
- `maxResults` (default 10) — caps the returned list.
- `offlineMode` (default `true`) — when `false`, hits the live registry for exact matches; cached registry data still backs the substring matches in both modes.

## Result composition

Each entry includes name, display name, latest version, truncated description, install status, installed version (if any), and the top-5 compatible versions.

## How to Call

```bash
unity-mcp-cli run-tool package-search --input '{
  "query": "string_value",
  "maxResults": 0,
  "offlineMode": false
}'
```

> For complex input (multi-line strings, code), save the JSON to a file and use:
> ```bash
> unity-mcp-cli run-tool package-search --input-file args.json
> ```
>
> Or pipe via stdin (recommended):
> ```bash
> unity-mcp-cli run-tool package-search --input-file - <<'EOF'
> {"param": "value"}
> EOF
> ```


### Troubleshooting

If `unity-mcp-cli` is not found, either install it globally (`npm install -g unity-mcp-cli`) or use `npx unity-mcp-cli` instead.
Read the /unity-initial-setup skill for detailed installation instructions.

## Input

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | Yes | The package id, name, or description. Can be: Full package id 'com.unity.textmeshpro', Full package name 'TextMesh Pro', Partial name 'TextMesh' (will search in Unity registry and installed packages), Description keyword 'rendering' (searches in package descriptions). |
| `maxResults` | `integer` | No | Maximum number of results to return. Default: 10 |
| `offlineMode` | `boolean` | No | Whether to perform the search in offline mode (uses cached registry data only). Default: true. Set to false to fetch latest exact matches from Unity registry. |

### Input JSON Schema

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "maxResults": {
      "type": "integer"
    },
    "offlineMode": {
      "type": "boolean"
    }
  },
  "required": [
    "query"
  ]
}
```

## Output

This tool does not return structured output.

