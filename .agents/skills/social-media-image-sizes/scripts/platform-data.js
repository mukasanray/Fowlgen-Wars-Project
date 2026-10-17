// Social media platform specs — matches branding5.com/tools/social-media-cheat-sheet
// Updated 2025

const platforms = [
  {
    name: 'Instagram', slug: 'instagram',
    categories: [
      { name: 'Profile', sizes: [
        { name: 'Profile Photo', width: 320, height: 320, aspect: '1:1', notes: 'Displays as 110×110 on mobile' }
      ]},
      { name: 'Feed Posts', sizes: [
        { name: 'Portrait Post',  width: 1080, height: 1350, aspect: '4:5',    maxFileSize: '30MB', notes: 'Best for engagement' },
        { name: 'Square Post',    width: 1080, height: 1080, aspect: '1:1',    maxFileSize: '30MB' },
        { name: 'Landscape Post', width: 1080, height: 566,  aspect: '1.91:1', maxFileSize: '30MB' }
      ]},
      { name: 'Stories & Reels', sizes: [
        { name: 'Story',                 width: 1080, height: 1920, aspect: '9:16',   notes: 'Keep text in safe zone (center 1080×1420)' },
        { name: 'Reel',                  width: 1080, height: 1920, aspect: '9:16',   notes: 'Cover photo: 1080×1920' },
        { name: 'Reel Cover Thumbnail',  width: 420,  height: 654,  aspect: '1:1.55', notes: 'Shown in grid as 1:1 crop' }
      ]},
      { name: 'Carousel', sizes: [
        { name: 'Carousel Square',   width: 1080, height: 1080, aspect: '1:1', notes: 'Up to 10 slides' },
        { name: 'Carousel Portrait', width: 1080, height: 1350, aspect: '4:5', notes: 'Up to 10 slides; best engagement' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'Feed Ad (Square)',    width: 1080, height: 1080, aspect: '1:1' },
        { name: 'Feed Ad (Landscape)', width: 1200, height: 628,  aspect: '1.91:1' },
        { name: 'Story Ad',            width: 1080, height: 1920, aspect: '9:16' }
      ]}
    ]
  },
  {
    name: 'Facebook', slug: 'facebook',
    categories: [
      { name: 'Profile & Cover', sizes: [
        { name: 'Profile Photo', width: 170,  height: 170, aspect: '1:1',    notes: 'Displays 176×176 on desktop, 196×196 on smartphones' },
        { name: 'Cover Photo',   width: 820,  height: 312, aspect: '2.63:1', notes: 'Min 400×150. Displays at 820×312 on desktop, 640×360 on mobile' }
      ]},
      { name: 'Feed Posts', sizes: [
        { name: 'Image Post (Landscape)', width: 1200, height: 630,  aspect: '1.91:1' },
        { name: 'Image Post (Square)',    width: 1200, height: 1200, aspect: '1:1' },
        { name: 'Image Post (Portrait)',  width: 1080, height: 1350, aspect: '4:5' }
      ]},
      { name: 'Stories & Reels', sizes: [
        { name: 'Story', width: 1080, height: 1920, aspect: '9:16', notes: 'Leave 14% top & 20% bottom for UI' },
        { name: 'Reel',  width: 1080, height: 1920, aspect: '9:16' }
      ]},
      { name: 'Events & Groups', sizes: [
        { name: 'Event Cover', width: 1920, height: 1005, aspect: '1.91:1' },
        { name: 'Group Cover', width: 1640, height: 856,  aspect: '1.91:1' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'Feed Ad',         width: 1200, height: 628,  aspect: '1.91:1' },
        { name: 'Carousel Ad',     width: 1080, height: 1080, aspect: '1:1',    notes: '2–10 cards' },
        { name: 'Right Column Ad', width: 1200, height: 628,  aspect: '1.91:1' },
        { name: 'Marketplace Ad',  width: 1200, height: 628,  aspect: '1.91:1' }
      ]}
    ]
  },
  {
    name: 'X (Twitter)', slug: 'twitter',
    categories: [
      { name: 'Profile & Header', sizes: [
        { name: 'Profile Photo', width: 400,  height: 400, aspect: '1:1', notes: 'Displayed as circle, 200×200' },
        { name: 'Header Image',  width: 1500, height: 500, aspect: '3:1' }
      ]},
      { name: 'Posts', sizes: [
        { name: 'Single Image', width: 1600, height: 900, aspect: '16:9',   notes: 'Min 600×335. Max 5MB (images), 15MB (GIFs)' },
        { name: 'Two Images',   width: 700,  height: 800, aspect: '7:8',    notes: 'Per image in 2-image post' },
        { name: 'Card Image',   width: 800,  height: 418, aspect: '1.91:1', notes: 'Link preview cards' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'Single Image Ad', width: 1200, height: 675, aspect: '16:9' },
        { name: 'Carousel Ad',     width: 800,  height: 800, aspect: '1:1',    notes: '2–6 cards' },
        { name: 'Website Card',    width: 800,  height: 418, aspect: '1.91:1' }
      ]}
    ]
  },
  {
    name: 'LinkedIn', slug: 'linkedin',
    categories: [
      { name: 'Profile & Cover', sizes: [
        { name: 'Profile Photo',    width: 400,  height: 400, aspect: '1:1',    notes: 'Min 200×200, max 8MB' },
        { name: 'Background Photo', width: 1584, height: 396, aspect: '4:1' },
        { name: 'Company Logo',     width: 300,  height: 300, aspect: '1:1' },
        { name: 'Company Cover',    width: 1128, height: 191, aspect: '5.91:1' }
      ]},
      { name: 'Feed Posts', sizes: [
        { name: 'Image Post (Landscape)', width: 1200, height: 627,  aspect: '1.91:1' },
        { name: 'Image Post (Square)',    width: 1200, height: 1200, aspect: '1:1' },
        { name: 'Image Post (Portrait)',  width: 1080, height: 1350, aspect: '4:5', notes: 'Best engagement on feed' }
      ]},
      { name: 'Articles & Newsletters', sizes: [
        { name: 'Article Cover',    width: 1920, height: 1080, aspect: '16:9' },
        { name: 'Newsletter Cover', width: 1920, height: 1080, aspect: '16:9' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'Sponsored Content', width: 1200, height: 627,  aspect: '1.91:1' },
        { name: 'Carousel Ad',       width: 1080, height: 1080, aspect: '1:1',    notes: '2–10 cards' },
        { name: 'Spotlight Ad Logo', width: 100,  height: 100,  aspect: '1:1' }
      ]}
    ]
  },
  {
    name: 'TikTok', slug: 'tiktok',
    categories: [
      { name: 'Profile', sizes: [
        { name: 'Profile Photo', width: 200, height: 200, aspect: '1:1' }
      ]},
      { name: 'Videos', sizes: [
        { name: 'Video (Full Screen)', width: 1080, height: 1920, aspect: '9:16', notes: 'Min 720×1280. Max 10 min.' },
        { name: 'Video Thumbnail',     width: 1080, height: 1920, aspect: '9:16', notes: 'Custom thumbnail from video' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'In-Feed Ad', width: 1080, height: 1920, aspect: '9:16', notes: '5–60 seconds' },
        { name: 'TopView Ad', width: 1080, height: 1920, aspect: '9:16', notes: 'Up to 60 seconds' },
        { name: 'Spark Ad',   width: 1080, height: 1920, aspect: '9:16', notes: 'Boosted organic content' }
      ]}
    ]
  },
  {
    name: 'YouTube', slug: 'youtube',
    categories: [
      { name: 'Channel Art', sizes: [
        { name: 'Profile Photo', width: 800,  height: 800,  aspect: '1:1',  notes: 'Displays as 98×98' },
        { name: 'Channel Banner', width: 2560, height: 1440, aspect: '16:9', notes: 'Safe area: 1546×423 (center)' }
      ]},
      { name: 'Videos', sizes: [
        { name: 'Video Upload (1080p)', width: 1920, height: 1080, aspect: '16:9' },
        { name: 'Video Upload (4K)',    width: 3840, height: 2160, aspect: '16:9' },
        { name: 'Custom Thumbnail',     width: 1280, height: 720,  aspect: '16:9', notes: 'Min 640×360. Max 2MB' },
        { name: 'Shorts',               width: 1080, height: 1920, aspect: '9:16', notes: 'Up to 60 seconds' }
      ]},
      { name: 'Community & Ads', sizes: [
        { name: 'Community Post Image', width: 1200, height: 675, aspect: '16:9' },
        { name: 'Display Ad',           width: 300,  height: 250, aspect: '6:5' },
        { name: 'Overlay Ad',           width: 480,  height: 70,  aspect: '48:7' }
      ]}
    ]
  },
  {
    name: 'Pinterest', slug: 'pinterest',
    categories: [
      { name: 'Profile', sizes: [
        { name: 'Profile Photo', width: 165, height: 165, aspect: '1:1' },
        { name: 'Board Cover',   width: 222, height: 150, aspect: '3:2' }
      ]},
      { name: 'Pins', sizes: [
        { name: 'Standard Pin', width: 1000, height: 1500, aspect: '2:3',   notes: 'Optimal ratio for feed' },
        { name: 'Square Pin',   width: 1000, height: 1000, aspect: '1:1' },
        { name: 'Long Pin',     width: 1000, height: 2100, aspect: '1:2.1', notes: 'Max ratio 1:2.1' },
        { name: 'Idea Pin',     width: 1080, height: 1920, aspect: '9:16',  notes: 'Up to 20 pages' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'Promoted Pin', width: 1000, height: 1500, aspect: '2:3' },
        { name: 'Carousel Ad',  width: 1000, height: 1500, aspect: '2:3', notes: '2–5 cards' },
        { name: 'Shopping Ad',  width: 1000, height: 1500, aspect: '2:3' }
      ]}
    ]
  },
  {
    name: 'Snapchat', slug: 'snapchat',
    categories: [
      { name: 'Content', sizes: [
        { name: 'Snap',      width: 1080, height: 1920, aspect: '9:16' },
        { name: 'Spotlight', width: 1080, height: 1920, aspect: '9:16', notes: '5–60 seconds' },
        { name: 'Story',     width: 1080, height: 1920, aspect: '9:16' }
      ]},
      { name: 'Ads', sizes: [
        { name: 'Single Image/Video Ad', width: 1080, height: 1920, aspect: '9:16' },
        { name: 'Collection Ad',         width: 1080, height: 1920, aspect: '9:16',   notes: 'Up to 4 tappable tiles' },
        { name: 'Filter/Lens',           width: 1080, height: 2340, aspect: '9:19.5', notes: 'Full device screen' }
      ]}
    ]
  },
  {
    name: 'Threads', slug: 'threads',
    categories: [
      { name: 'Profile', sizes: [
        { name: 'Profile Photo', width: 320, height: 320, aspect: '1:1', notes: 'Same as Instagram profile' }
      ]},
      { name: 'Posts', sizes: [
        { name: 'Image Post (Square)',    width: 1080, height: 1080, aspect: '1:1' },
        { name: 'Image Post (Landscape)', width: 1080, height: 566,  aspect: '1.91:1' },
        { name: 'Image Post (Portrait)',  width: 1080, height: 1350, aspect: '4:5' }
      ]}
    ]
  }
];

// Flat list of all specs with platform/category context — useful for check.js
function getAllSpecs() {
  const specs = [];
  for (const platform of platforms) {
    for (const category of platform.categories) {
      for (const size of category.sizes) {
        specs.push({ platform: platform.name, slug: platform.slug, category: category.name, ...size });
      }
    }
  }
  return specs;
}

// Generate a slug-style key for resize.js targeting, e.g. "instagram-portrait-post"
function getSpecKey(platformName, sizeName) {
  return `${platformName}-${sizeName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

module.exports = { platforms, getAllSpecs, getSpecKey };
