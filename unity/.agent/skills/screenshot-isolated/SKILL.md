---
name: screenshot-isolated
description: Render a target GameObject from a chosen camera angle with optional layer-based isolation, configurable background (solid/skybox/transparent), multi-light setup via JSON, and Composite (2x2 Front/Right/Back/Top) mode. Returns a PNG image. When isolated=true, inactive children may briefly fire OnEnable — see the body for side-effect notes.
metadata:
  generated-by: mcp-plugin-dotnet
---

# Screenshot / Isolated GameObject

Renders a screenshot of a target GameObject with configurable isolation, background, camera angle, and lighting. When isolated=true (default), only the target object is visible via layer-based culling and inactive children of the target are temporarily activated for the render (their OnEnable callbacks may fire — restored in finally, but side effects like audio/network/animation events are not undoable). When isolated=false, the existing scene state is rendered as-is without activating inactive objects. Supports custom multi-light setups via JSON. Returns a base64-encoded PNG.

## Camera views

`Front` (-Z), `Back` (+Z), `Left` (-X), `Right` (+X), `Top` (+Y), `Bottom` (-Y). `Composite` produces a single 2x2 image (Front, Right, Back, Top) where each sub-view uses the requested `resolution`, so the final image is `resolution*2 x resolution*2`.

## Background modes

- `SolidColor` — flat color from `backgroundColor` (hex string).
- `Skybox` — current scene skybox.
- `Transparent` — alpha-zero (ARGB32 PNG; useful for compositing).

## Lights

`lights` is an optional JSON array of `IsolatedLightConfig` objects (type, color, intensity, rotation, position, range, spotAngle, innerSpotAngle, shadows, shadowStrength, bounceIntensity, colorTemperature, cookieSize, cullingMask, renderMode). When `null`, a default 1.0-intensity white directional light at rotation `(50, -30, 0)` is used. Empty array `[]` explicitly disables extra lights.

## Side-effect caveat

Isolation temporarily activates inactive child GameObjects so their renderers participate in the cull. Activation state is restored in `finally`, but OnEnable-triggered side effects (audio, networking, animation events) are not rewindable. Set `isolated=false` if your scene contains scripts that must not fire OnEnable during the capture.

## How to Call

```bash
unity-mcp-cli run-tool screenshot-isolated --input '{
  "gameObjectRef": "string_value",
  "includeChildren": false,
  "isolated": false,
  "backgroundMode": "string_value",
  "backgroundColor": "string_value",
  "cameraView": "string_value",
  "fieldOfView": 0,
  "nearClipPlane": 0,
  "farClipPlane": 0,
  "padding": 0,
  "lights": "string_value",
  "resolution": 0
}'
```

> For complex input (multi-line strings, code), save the JSON to a file and use:
> ```bash
> unity-mcp-cli run-tool screenshot-isolated --input-file args.json
> ```
>
> Or pipe via stdin (recommended):
> ```bash
> unity-mcp-cli run-tool screenshot-isolated --input-file - <<'EOF'
> {"param": "value"}
> EOF
> ```


### Troubleshooting

If `unity-mcp-cli` is not found, either install it globally (`npm install -g unity-mcp-cli`) or use `npx unity-mcp-cli` instead.
Read the /unity-initial-setup skill for detailed installation instructions.

## Input

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `gameObjectRef` | `string` | Yes | Reference to the target GameObject (by instanceId, path, or name). RQL: GameObjectRef |
| `includeChildren` | `boolean` | No | Include child GameObjects in the render. Default: true. |
| `isolated` | `boolean` | No | When true, renders only the target object using layer-based culling. When false, renders the full scene from the computed camera position. Default: true. |
| `backgroundMode` | `string` | No | Background mode. Default: SolidColor. |
| `backgroundColor` | `string` | No | Hex background color (e.g. '#404040'). Only used when backgroundMode is SolidColor. |
| `cameraView` | `string` | No | Camera angle relative to the target object's bounding box. Default: Front. |
| `fieldOfView` | `number` | No | Camera vertical field of view in degrees. Default: 60. |
| `nearClipPlane` | `number` | No | Camera near clip plane distance. Default: 0.01. |
| `farClipPlane` | `number` | No | Camera far clip plane distance. Default: 1000. |
| `padding` | `number` | No | Framing multiplier around the object. 1.0 = tight fit, 1.5 = 50% extra space. Default: 1.2. |
| `lights` | `string` | No | JSON array of light configurations. Each object defines type, color, intensity, rotation, position, range, spotAngle, shadows, etc. When null, a default white directional light at rotation (50,-30,0) is used. Example: [{"type":"Directional","color":"#FFF4E5","intensity":1.2,"rotation":[45,-45,0]}] |
| `resolution` | `integer` | No | Output image resolution in pixels (width = height). Default: 512. |

### Input JSON Schema

```json
{
  "type": "object",
  "properties": {
    "gameObjectRef": {
      "type": "string"
    },
    "includeChildren": {
      "type": "boolean"
    },
    "isolated": {
      "type": "boolean"
    },
    "backgroundMode": {
      "type": "string",
      "enum": [
        "SolidColor",
        "Skybox",
        "Transparent"
      ]
    },
    "backgroundColor": {
      "type": "string"
    },
    "cameraView": {
      "type": "string",
      "enum": [
        "Front",
        "Back",
        "Left",
        "Right",
        "Top",
        "Bottom",
        "Composite"
      ]
    },
    "fieldOfView": {
      "type": "number"
    },
    "nearClipPlane": {
      "type": "number"
    },
    "farClipPlane": {
      "type": "number"
    },
    "padding": {
      "type": "number"
    },
    "lights": {
      "type": "string"
    },
    "resolution": {
      "type": "integer"
    }
  },
  "required": [
    "gameObjectRef"
  ]
}
```

## Output

This tool does not return structured output.

