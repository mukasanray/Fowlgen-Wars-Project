---
name: script-execute
description: Compiles and executes C# code dynamically using Roslyn. Supports a full-code mode (default) and a body-only mode — see the skill body for the difference and for how to pass Unity object references as parameters.
metadata:
  generated-by: mcp-plugin-dotnet
---

# Script / Execute

## Modes

- **Full code mode** (default, `isMethodBody=false`): the `csharpCode` argument must define a complete class with a static method (no top-level statements).
- **Body-only mode** (`isMethodBody=true`): provide only the method body statements. The tool auto-generates the usings, class, and method header.

## Passing Unity objects as parameters

Unity objects (`GameObject`, `Component`, etc.) can be passed as parameters using their `Ref` types (`GameObjectRef`, `ComponentRef`, etc.) or directly by type:

- `UnityEngine.GameObject` — resolves an actual GameObject from value `{"instanceID": N}`, `{"name": "..."}`, or `{"path": "..."}`.
- `UnityEngine.Component` (or any component subtype) — resolves from `{"instanceID": N}`.
- `AIGD.GameObjectRef` — passes a `GameObjectRef` POCO directly; the method body calls `goRef.FindGameObject()` to resolve it.
- `AIGD.ComponentRef` — passes a `ComponentRef` POCO.
- `AIGD.ObjectRef` — passes a base `ObjectRef` POCO.

## How to Call

```bash
unity-mcp-cli run-tool script-execute --input '{
  "csharpCode": "string_value",
  "className": "string_value",
  "methodName": "string_value",
  "parameters": "string_value",
  "isMethodBody": false
}'
```

> For complex input (multi-line strings, code), save the JSON to a file and use:
> ```bash
> unity-mcp-cli run-tool script-execute --input-file args.json
> ```
>
> Or pipe via stdin (recommended):
> ```bash
> unity-mcp-cli run-tool script-execute --input-file - <<'EOF'
> {"param": "value"}
> EOF
> ```


### Troubleshooting

If `unity-mcp-cli` is not found, either install it globally (`npm install -g unity-mcp-cli`) or use `npx unity-mcp-cli` instead.
Read the /unity-initial-setup skill for detailed installation instructions.

## Input

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `csharpCode` | `string` | Yes | C# code to compile and execute. In full code mode (default, isMethodBody=false): must define a complete class with a static method. Example: 'using UnityEngine; public class Script { public static void Main() { Debug.Log("Hello"); } }'. Do NOT use top-level statements. In body-only mode (isMethodBody=true): provide only the method body statements. The tool auto-generates usings, class, and method header. Example body: 'go.SetActive(false);'. Custom helper classes can still be defined inline in the body-only string after the main logic, but for complex additional class definitions use full code mode instead. |
| `className` | `string` | No | The name of the class containing the method to execute. In body-only mode this becomes the generated class name. |
| `methodName` | `string` | No | The name of the method to execute. Must be a static method. In body-only mode this becomes the generated method name. |
| `parameters` | `string` | No | Values for the method's parameters by name, e.g. {go: ref("GameObject#12"), n: 6}. Leave empty if the method takes none. RQL: SerializedMemberList |
| `isMethodBody` | `boolean` | No | When true, 'csharpCode' is treated as just the method body. The tool auto-generates standard using directives (System, UnityEngine, AIGD, com.IvanMurzak.Unity.MCP.Runtime.Extensions, UnityEditor), the class definition, and the method signature (returns object when the body returns a value, void otherwise). Parameters from the 'parameters' list are automatically added to the method signature using their typeName and name. When false (default), 'csharpCode' must be a complete C# compilation unit with class and method definitions. |

### Input JSON Schema

```json
{
  "type": "object",
  "properties": {
    "csharpCode": {
      "type": "string"
    },
    "className": {
      "type": "string"
    },
    "methodName": {
      "type": "string"
    },
    "parameters": {
      "type": "string"
    },
    "isMethodBody": {
      "type": "boolean"
    }
  },
  "required": [
    "csharpCode"
  ]
}
```

## Output

This tool does not return structured output.

