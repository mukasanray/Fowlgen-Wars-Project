# Social Media Image Sizes

Free, open-source AI agent skill from [Branding5](https://www.branding5.com).

> Check and resize images for every major social media platform.

Validates image dimensions against 60+ specs across Instagram, Facebook, X (Twitter), LinkedIn, TikTok, YouTube, Pinterest, Snapchat, and Threads. Outputs a ranked match list and generates correctly-sized exports via [sharp](https://sharp.pixelplumbing.com/).

**Install:**

```bash
npx skills add Branding5/social-media-image-sizes
```

**Use when a user asks:**

- _"Is this image the right size for Instagram?"_
- _"Resize this photo for a LinkedIn banner"_
- _"What size should my YouTube thumbnail be?"_
- _"Prep these assets for Facebook ads"_
- _"Check if my image fits the TikTok spec"_

**Check an image:**

```bash
node scripts/check.js image.png
```

![check output](./assets/check-output.png)

**Resize to a named spec:**

```bash
node scripts/resize.js image.png "Instagram Profile Photo"
```

![resize output](./assets/resize-output.png)

**Platforms covered:**

| Platform    | Specs                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Instagram   | Profile, Feed (portrait/square/landscape), Stories, Reels, Carousel, Ads |
| Facebook    | Profile, Cover, Feed, Stories, Reels, Events, Groups, Ads                |
| X (Twitter) | Profile, Header, Posts, Cards, Ads                                       |
| LinkedIn    | Profile, Background, Company, Feed, Articles, Newsletters, Ads           |
| TikTok      | Profile, Videos, Ads                                                     |
| YouTube     | Profile, Banner, Thumbnails, Shorts, Community, Ads                      |
| Pinterest   | Profile, Boards, Standard/Square/Long/Idea Pins, Ads                     |
| Snapchat    | Snaps, Spotlight, Stories, Ads, Filters/Lenses                           |
| Threads     | Profile, Posts                                                           |

→ [View skill](./SKILL.md) · [Full reference](./AGENTS.md) · [Interactive tool](https://www.branding5.com/tools/social-media-cheat-sheet)

---

## Installation

```bash
npx skills add Branding5/social-media-image-sizes
```

Install globally so it's available in every project:

```bash
npx skills add Branding5/social-media-image-sizes -g
```

## Contributing

Bug reports and pull requests welcome. If a platform updates its specs, open an issue or PR against the relevant file in `references/` or `scripts/platform-data.js`.

## License

MIT — free to use, fork, and redistribute.

---

_Skills built alongside [Branding5](https://www.branding5.com) — AI brand positioning and marketing strategy_
