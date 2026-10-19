---
name: screenshot-camera
description: Capture a screenshot from a Unity `Camera` and return it as a PNG image for direct LLM inspection. Falls back to `Camera.main` (then any active camera) when `cameraRef` is null. Width and height are capped to keep response size manageable.
metadata:
  generated-by: mcp-plugin-dotnet
---

# Screenshot / Camera

Captures a screenshot from a camera and returns it as an image. If no camera is specified, uses the Main Camera. Returns the image directly for visual inspection by the LLM.

## Inputs

- `cameraRef` (optional) — reference to a GameObject hosting a `Camera`. When null, `Camera.main` is used; if there is no main camera, the first entry of `Camera.allCameras` is used.
- `width` (default 1920) / `height` (default 1080) — output pixels. Must be > 0 and ≤ `MaxDimension`.

## Behavior

Allocates a temporary `RenderTexture`, swaps it onto the chosen camera, calls `Camera.Render`, reads back via `Texture2D.ReadPixels`, encodes as PNG, and restores the camera's prior `targetTexture`. Returns a `ResponseCallTool.Image` with `image/png` MIME and a descriptive caption.

## How to Call

```bash
unity-mcp-cli run-tool screenshot-camera --input '{
  "cameraRef": "string_value",
  "width": 0,
  "height": 0
}'
```

> For complex input (multi-line strings, code), save the JSON to a file and use:
> ```bash
> unity-mcp-cli run-tool screenshot-camera --input-file args.json
> ```
>
> Or pipe via stdin (recommended):
> ```bash
> unity-mcp-cli run-tool screenshot-camera --input-file - <<'EOF'
> {"param": "value"}
> EOF
> ```


### Troubleshooting

If `unity-mcp-cli` is not found, either install it globally (`npm install -g unity-mcp-cli`) or use `npx unity-mcp-cli` instead.
Read the /unity-initial-setup skill for detailed installation instructions.

## Input

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `cameraRef` | `string` | No | Reference to the camera GameObject. If not specified, uses the Main Camera. RQL: GameObjectRef |
| `width` | `integer` | No | Width of the screenshot in pixels. |
| `height` | `integer` | No | Height of the screenshot in pixels. |

### Input JSON Schema

```json
{
  "type": "object",
  "properties": {
    "cameraRef": {
      "type": "string"
    },
    "width": {
      "type": "integer"
    },
    "height": {
      "type": "integer"
    }
  }
}
```

## Output

This tool does not return structured output.

