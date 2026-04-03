# Production cache headers (Vite SPA / lazy routes)

Stale `index.html` after a deploy points at old hashed chunks → `Failed to fetch dynamically imported module`. Keep HTML revalidating and hashed assets long-lived.

## Already in this repo

- **Vercel:** [`vercel.json`](vercel.json) — `Cache-Control` for all routes, then overrides `/assets/*` with `immutable` (last rule wins).
- **Netlify / Cloudflare Pages:** [`public/_headers`](public/_headers) — copied into `dist/` on build.

## nginx (e.g. `www.guidexpert.co.in`)

```nginx
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}

location / {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    try_files $uri /index.html;
}
```

Adjust if you serve the app under a subpath (`alias` / `root`).

## Cloudflare (or other CDN)

- **HTML / SPA responses:** set **Cache Level** to **Bypass** or **Standard** with short edge TTL (0s or respect origin `no-cache`).
- **Path `/assets/*`:** long TTL + treat as immutable (or “Cache Everything” with long TTL only for that path).
- Purge cache after deploy if you previously cached HTML aggressively.

## Deploy practice

Upload/replace the full `dist/` output atomically so users never see a mix of new `index.html` and missing old chunks.
