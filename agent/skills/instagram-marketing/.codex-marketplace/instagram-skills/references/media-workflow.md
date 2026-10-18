# Instagram Media Publishing Workflow

Instagram requires media on every post. There is no text-only Instagram post:
the API rejects it. So the writer skills in this bundle produce the **caption,
hook, hashtags, and slide or shot plan**, and the **user supplies the image or
video file**. Publishing is always a media flow.

## Contents

- The flow (Publora tier)
- Container rules (what the media list becomes)
- Media limits (publish-time)
- Manual tier (no Publora)
- Cleaning up a failed upload

## The flow (Publora tier)

Instagram publishing is a three-step flow. Creating a post with a `scheduledTime`
up front races Instagram's scheduler against the S3 upload, so the order is
mandatory:

```
1. POST /create-post          -> create a DRAFT (no scheduledTime), get postGroupId
2. POST /get-upload-url       -> pre-signed S3 URL for one file
   PUT  {uploadUrl}            -> upload the file bytes to S3
   (repeat 2 per image for a 2-10 item carousel, in slide order)
3. PUT  /update-post/:postGroupId  -> status="scheduled" + scheduledTime
```

In this bundle, `lib/publora_client.py` wraps the whole flow in one method:

```python
from lib import PubloraClient

client = PubloraClient()  # reads PUBLORA_API_KEY
result = client.publish_media_post(
    content="the 3-step setup is below, steal it\n\n#niche #mid #broad",
    platforms=["instagram-11223344"],   # INSTAGRAM_PLATFORM_ID
    media=["slide1.jpg", "slide2.jpg", "slide3.jpg"],  # local paths, in order
    scheduled_time="2026-07-01T15:00:00.000Z",  # omit for ~now
)
# -> {"postGroupId": ..., "media": [...], "scheduled": {...}}
```

Or call the high-level `publish()` wrapper, which routes to manual / Publora /
diy and only auto-posts when media file paths are supplied:

```python
from lib import publish

publish(
    "carousel",
    draft_text="<approved caption>",
    target_url="https://www.instagram.com/",
    media=["slide1.jpg", "slide2.jpg", "slide3.jpg"],
    scheduled_time="2026-07-01T15:00:00.000Z",
)
```

On any failure after the draft is created, `publish_media_post` deletes the
draft so no broken post group with an abandoned upload is left behind.

## Container rules (what the media list becomes)

| Media supplied | Becomes | Notes |
|---|---|---|
| 1 image (JPEG/PNG/WebP) | a single photo post | WebP auto-converts to JPEG |
| 2-10 images | a carousel, in list order | no mixed media, all images |
| 1 video (MP4/MOV) | a Reel by default | Story via `videoType: "STORIES"` |
| mixed images + video | rejected | the API does not allow mixed carousels |

Set the surface with `platform_settings`:

```json
{ "platformSettings": { "instagram": { "videoType": "REELS" } } }
```

`videoType` is `"REELS"` (default) or `"STORIES"`. The bundle sets this
automatically for `kind="reel"` and `kind="story"`.

## Media limits (publish-time)

| Item | Limit |
|---|---|
| Image formats | JPEG, PNG, WebP (WebP auto-converts to JPEG) |
| Image max size | 8 MB |
| Carousel items | 2-10 (API) |
| Reel duration | up to 3 min (180s); 5-90s eligible for the Reels tab |
| Reel/video size | 300 MB |
| Carousel video clip | up to 60s |
| Aspect ratio | 4:5 portrait to 1.91:1 landscape; 4:5 fills the feed best |
| Caption | 2,200 chars (first ~125 visible) |
| Account type | Business or Creator (personal is not supported) |

## Manual tier (no Publora)

With no `PUBLORA_API_KEY`, or when the user has not pointed the skill at media
files, every skill returns the approved caption as a copy-paste block plus a
reminder to attach the media in the Instagram app. Instagram still needs the
image or video, so the reminder is not optional.

## Cleaning up a failed upload

If a `get-upload-url` call succeeds but the S3 PUT fails, the draft holds a
broken media reference that blocks re-scheduling. Delete the whole draft and
start over:

```python
client.delete_post(post_group_id)   # DELETE /delete-post/:id
```

`publish_media_post` already does this on failure.
