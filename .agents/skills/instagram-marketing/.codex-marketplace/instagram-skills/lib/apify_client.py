"""Apify read client for the Instagram Skills project.

The read layer: given a niche hashtag or a username, pull the posts that are
traveling in a niche, or a profile's public stats, so a skill can see what is
working and how an account (yours or a competitor's) performs. Uses the
run-sync-get-dataset-items endpoint (one HTTP request, no polling).

Auth: APIFY_TOKEN env var (or constructor arg). Get one at
https://console.apify.com/account/integrations (free tier included).

Actors (verified live 2026-07-13):
  - apify/instagram-hashtag-scraper. Input {"hashtags":["marketing"],
    "resultsLimit":20}. Returns posts with caption, likesCount, commentsCount,
    ownerUsername, url. Niche discovery: what is traveling under a hashtag.
  - apify/instagram-profile-scraper. Input {"usernames":["natgeo"]}. Returns
    username, followersCount, postsCount, biography, etc. Competitor/self
    profile stats.

What Instagram does NOT expose reliably: the list of who LIKED a post, or the
identities of the commenters on someone else's post (capped and cookie-gated).
So the read layer is NICHE DISCOVERY + PROFILE/COMPETITOR stats, NOT engager
segmentation. That is a platform wall, not a client limitation.

Caching: in-process LRU (256 entries, 6h TTL). force_refresh=True to bypass.
Retries transient 429/5xx (3 attempts, exponential backoff + jitter).
"""
from __future__ import annotations
import os
import random
import time
from collections import OrderedDict
from typing import Any, Optional

import requests
from ._env import load_env

HASHTAG_ACTOR = "apify~instagram-hashtag-scraper"
PROFILE_ACTOR = "apify~instagram-profile-scraper"
RUN_SYNC = "https://api.apify.com/v2/acts/{actor}/run-sync-get-dataset-items"
RETRYABLE_STATUSES = {429, 500, 502, 503, 504}
CACHE_MAX_ENTRIES = 256
CACHE_TTL_SECONDS = 6 * 60 * 60
SIGNUP_URL = "https://console.apify.com/account/integrations"


class ApifyError(RuntimeError):
    pass


class ApifyAuthError(ApifyError):
    """No token configured. Message explains the free path + paste fallback."""


def _retry(attempts: int = 3, base_delay: float = 0.6):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            last: Optional[Exception] = None
            for i in range(attempts):
                try:
                    return fn(*args, **kwargs)
                except ApifyError as e:
                    if getattr(e, "status", None) not in RETRYABLE_STATUSES or i == attempts - 1:
                        raise
                    last = e
                    time.sleep(base_delay * (2 ** i) + random.uniform(0, 0.3))
            if last:
                raise last
        return wrapper
    return decorator


def _count(value: Any) -> Optional[int]:
    """A count, or None when the actor says it is hidden (a negative)."""
    if isinstance(value, int) and value >= 0:
        return value
    return None


def _post(p: dict) -> dict:
    owner = p.get("ownerUsername") or p.get("owner", {}).get("username")
    shortcode = p.get("shortCode") or p.get("shortcode")
    return {
        "id": p.get("id") or shortcode,
        "caption": p.get("caption") or "",
        # The actor returns -1 when a count is hidden by the account. Passing
        # that through as a number ranks a hidden post below a post with zero
        # engagement, so it becomes None: unknown, not worst.
        "likes": _count(p.get("likesCount")),
        "comments": _count(p.get("commentsCount")),
        "owner": owner,
        "type": p.get("type") or p.get("productType"),
        "timestamp": p.get("timestamp"),
        "url": p.get("url") or (f"https://www.instagram.com/p/{shortcode}/" if shortcode else None),
    }


def _profile(p: dict) -> dict:
    return {
        "username": p.get("username"),
        "full_name": p.get("fullName"),
        "followers": p.get("followersCount"),
        "following": p.get("followsCount"),
        "posts": p.get("postsCount"),
        "bio": p.get("biography") or "",
        "verified": p.get("verified", False),
        "is_business": p.get("isBusinessAccount", False),
        "category": p.get("businessCategoryName") or p.get("categoryName"),
        "external_url": p.get("externalUrl"),
        "url": f"https://www.instagram.com/{p.get('username')}/" if p.get("username") else None,
    }


class ApifyClient:
    def __init__(self, token: Optional[str] = None, timeout: int = 180):
        load_env()
        self.token = token or os.environ.get("APIFY_TOKEN")
        self.timeout = timeout
        self._cache: "OrderedDict[str, tuple[float, Any]]" = OrderedDict()

    def _require(self) -> str:
        if not self.token:
            raise ApifyAuthError(
                "No APIFY_TOKEN set. Get one free at "
                f"{SIGNUP_URL}. Or paste the posts/profile stats you already have "
                "and the skill will run the same analysis on them."
            )
        return self.token

    def _cget(self, k):
        h = self._cache.get(k)
        if h and (time.time() - h[0]) < CACHE_TTL_SECONDS:
            self._cache.move_to_end(k)
            return h[1]
        return None

    def _cput(self, k, v):
        self._cache[k] = (time.time(), v)
        self._cache.move_to_end(k)
        while len(self._cache) > CACHE_MAX_ENTRIES:
            self._cache.popitem(last=False)

    @_retry()
    def _run(self, actor: str, payload: dict) -> list[dict]:
        try:
            r = requests.post(RUN_SYNC.format(actor=actor),
                              params={"token": self._require()}, json=payload,
                              allow_redirects=False, timeout=self.timeout)
        except requests.RequestException as e:
            err = ApifyError(f"network error: {e}"); err.status = 503; raise err
        if r.status_code >= 400:
            err = ApifyError(f"actor returned {r.status_code}: {r.text[:200]}")
            err.status = r.status_code; raise err
        data = r.json()
        if not isinstance(data, list):
            raise ApifyError(f"unexpected response shape: {str(data)[:150]}")
        if data and isinstance(data[0], dict) and data[0].get("error"):
            raise ApifyError(f"actor error: {data[0].get('errorDescription') or data[0].get('error')}")
        return data

    # ---- public read methods ----
    RESULT_TYPES = ("reels", "posts", "stories")

    def fetch_niche_posts(self, hashtag: str, max_items: int = 20,
                          kind: str = "reels",
                          force_refresh: bool = False) -> list[dict]:
        """What is traveling under a hashtag. Returns caption, likes, comments,
        owner, url per item.

        `kind` reaches the actor as `resultsType` and defaults to reels, which
        is the only mode that carries engagement. The actor's own default,
        "posts", returns the most recent feed posts, and those are minutes old:
        measured across #marketing, #fitness and #coffee, 14 of 15 rows came
        back with `likesCount` of 0, while reels on the same hashtags returned
        758, 2004, 3462 and so on. Ranking "what is working" over the posts mode
        was ranking noise. Pass kind="posts" when the question really is what
        was just published.
        """
        if kind not in self.RESULT_TYPES:
            raise ValueError(f"kind must be one of {self.RESULT_TYPES}, got {kind!r}")
        h = hashtag.lstrip("#")
        ck = f"hashtag:{h}:{max_items}:{kind}"
        if not force_refresh and (c := self._cget(ck)) is not None:
            return c
        rows = self._run(HASHTAG_ACTOR, {"hashtags": [h], "resultsLimit": max_items,
                                         "resultsType": kind})
        out = [_post(p) for p in rows if isinstance(p, dict) and (p.get("id") or p.get("shortCode"))]
        self._cput(ck, out)
        return out

    def fetch_profile(self, username: str,
                      force_refresh: bool = False) -> Optional[dict]:
        """Public profile stats for a handle (self or competitor).
        Returns username, followers, posts, bio, and more."""
        u = username.lstrip("@")
        ck = f"profile:{u}"
        if not force_refresh and (c := self._cget(ck)) is not None:
            return c
        rows = self._run(PROFILE_ACTOR, {"usernames": [u]})
        prof = next((_profile(p) for p in rows
                     if isinstance(p, dict) and p.get("username")), None)
        self._cput(ck, prof)
        return prof


if __name__ == "__main__":
    import json as _json
    print(_json.dumps(ApifyClient().fetch_profile("natgeo"), indent=2))
    print(_json.dumps(ApifyClient().fetch_niche_posts("marketing", 2), indent=2))
