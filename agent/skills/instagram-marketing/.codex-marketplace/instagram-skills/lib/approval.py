"""Approval gate helpers.

Every skill that posts to Instagram MUST present a draft to the user and wait
for explicit approval before calling Publora. This file is a thin conventions
layer, not runtime enforcement. Skills call `render_approval_card` to format the
draft consistently and then stop until the user says go.
"""
from __future__ import annotations
from typing import Optional


def render_approval_card(
    *,
    kind: str,  # "post" | "carousel" | "reel" | "story"
    preview_text: str,
    target_url: Optional[str] = None,
    char_count: Optional[int] = None,
    slide_count: Optional[int] = None,
    media_note: Optional[str] = None,
    extra_context: Optional[dict] = None,
) -> str:
    """Format a standardized approval card for the user to review.

    The card MUST contain:
    - What the action is (post / carousel / reel / story)
    - The full caption preview
    - Char count (Instagram caption cap is 2,200; first ~125 show before "more")
    - Slide count for a carousel
    - A reminder of the media the user must supply (Instagram needs media)
    - A clear prompt: "reply post / yes to publish, or suggest edits"
    """
    lines = [f"## Draft ready for approval - {kind}", ""]
    if target_url:
        lines.append(f"**Target:** {target_url}")
    if char_count is None:
        char_count = len(preview_text)
    fold = " (first ~125 show before the 'more' fold)" if char_count > 125 else ""
    lines.append(f"**Caption chars:** {char_count} / 2200{fold}")
    if slide_count is not None:
        lines.append(f"**Slides:** {slide_count}")
    if media_note:
        lines.append(f"**Media you supply:** {media_note}")
    lines.append("")
    lines.append("**Caption preview:**")
    lines.append("")
    for pl in preview_text.splitlines() or [""]:
        lines.append(f"> {pl}")
    lines.append("")
    if extra_context:
        lines.append("**Context:**")
        for k, v in extra_context.items():
            lines.append(f"- **{k}**: {v}")
        lines.append("")
    lines.append("Reply **post** / **yes** to publish, or suggest edits.")
    return "\n".join(lines)
