"""Instagram URL parser.

Handles the common shapes for posts, Reels, and profiles:

1. Feed post (from "Copy link"):
   https://www.instagram.com/p/SHORTCODE/
   https://instagram.com/p/SHORTCODE/?img_index=1

2. Reel:
   https://www.instagram.com/reel/SHORTCODE/
   https://www.instagram.com/reels/SHORTCODE/

3. Profile:
   https://www.instagram.com/USERNAME
   https://www.instagram.com/USERNAME/

4. Story (best-effort; stories expire after 24h):
   https://www.instagram.com/stories/USERNAME/MEDIA_ID/

Returns a normalized dict:
    {
      "username": "<handle>" | None,      # without the leading @
      "shortcode": "<base64-ish id>" | None,
      "url_type": "post" | "reel" | "profile" | "story" | "unknown",
      "canonical_url": "https://www.instagram.com/..." | None,
    }

Note: a post and a carousel share the /p/ path; the parser does not distinguish
them (the carousel is detected from the media itself, not the URL). A Reel uses
/reel/ or /reels/ and is normalized to /reel/. Instagram has no public,
documented post-read API wired into this bundle, so the hook-extractor asks the
user to paste the caption; the parser only structures the URL.
"""
from __future__ import annotations
import re
from typing import Optional, TypedDict


class ParsedInstagramUrl(TypedDict, total=False):
    username: Optional[str]
    shortcode: Optional[str]
    url_type: str
    canonical_url: Optional[str]


# /p/SHORTCODE or /reel/SHORTCODE or /reels/SHORTCODE  (optionally /USERNAME/ before it)
# Note: /tv/ (legacy IGTV) is deliberately NOT matched here. It stays in
# _RESERVED so it is never read as a username; an /tv/ URL parses as "unknown"
# rather than being silently remapped to a "post".
_POST_RE = re.compile(
    r"(?:https?://)?(?:www\.)?instagram\.com/"
    r"(?:(?P<user>[A-Za-z0-9_.]{1,30})/)?"
    r"(?P<kind>p|reel|reels)/"
    r"(?P<shortcode>[A-Za-z0-9_-]{5,30})",
    re.IGNORECASE,
)
# /stories/USERNAME/MEDIA_ID
_STORY_RE = re.compile(
    r"(?:https?://)?(?:www\.)?instagram\.com/stories/"
    r"(?P<user>[A-Za-z0-9_.]{1,30})/(?P<mediaid>\d{5,25})",
    re.IGNORECASE,
)
# Profile URL: /USERNAME  (no reserved first segment, no /p//reel)
_PROFILE_RE = re.compile(
    r"(?:https?://)?(?:www\.)?instagram\.com/"
    r"(?P<user>[A-Za-z0-9_.]{1,30})/?(?:\?.*)?$",
    re.IGNORECASE,
)
# Reserved first-path segments that are not usernames.
_RESERVED = {
    "p", "reel", "reels", "tv", "stories", "explore", "accounts", "direct",
    "about", "developer", "legal", "privacy", "terms", "web", "challenge",
    "login", "signup", "session",
}


def parse_instagram_url(url: str) -> ParsedInstagramUrl:
    """Parse any Instagram post, Reel, story, or profile URL.

    >>> p = parse_instagram_url("https://www.instagram.com/p/C8xYz12abcd/")
    >>> p["shortcode"]
    'C8xYz12abcd'
    >>> p["url_type"]
    'post'
    >>> parse_instagram_url("https://instagram.com/reel/C9_aBcDeF/")["url_type"]
    'reel'
    """
    out: ParsedInstagramUrl = {
        "username": None,
        "shortcode": None,
        "url_type": "unknown",
        "canonical_url": None,
    }
    if not url:
        return out

    text = url.strip()

    m = _POST_RE.search(text)
    if m:
        shortcode = m.group("shortcode")
        kind = m.group("kind").lower()
        user = m.group("user")
        out["shortcode"] = shortcode
        if user and user.lower() not in _RESERVED:
            out["username"] = user
        if kind in ("reel", "reels"):
            out["url_type"] = "reel"
            out["canonical_url"] = f"https://www.instagram.com/reel/{shortcode}/"
        else:
            out["url_type"] = "post"
            out["canonical_url"] = f"https://www.instagram.com/p/{shortcode}/"
        return out

    m = _STORY_RE.search(text)
    if m:
        out["username"] = m.group("user")
        out["shortcode"] = m.group("mediaid")
        out["url_type"] = "story"
        out["canonical_url"] = (
            f"https://www.instagram.com/stories/{m.group('user')}/"
            f"{m.group('mediaid')}/"
        )
        return out

    m = _PROFILE_RE.search(text)
    if m:
        user = m.group("user")
        if user.lower() not in _RESERVED:
            out["username"] = user
            out["url_type"] = "profile"
            out["canonical_url"] = f"https://www.instagram.com/{user}/"
            return out

    return out


def build_post_url(shortcode: str, *, reel: bool = False) -> str:
    """Format a canonical instagram.com post or reel URL from a shortcode."""
    path = "reel" if reel else "p"
    return f"https://www.instagram.com/{path}/{shortcode}/"


if __name__ == "__main__":
    import json
    import sys

    examples = sys.argv[1:] or [
        "https://www.instagram.com/p/C8xYz12abcd/?img_index=1",
        "https://www.instagram.com/reel/C9_aBcDeF/",
        "https://instagram.com/natgeo/reel/C9_aBcDeF/",
        "https://www.instagram.com/natgeo/",
        "https://www.instagram.com/stories/natgeo/3201234567890123456/",
    ]
    for u in examples:
        print(u)
        print(json.dumps(parse_instagram_url(u), indent=2))
        print()
