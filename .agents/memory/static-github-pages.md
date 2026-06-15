---
name: Static GitHub Pages build
description: How the static GitHub Pages version is built and deployed for this project.
---

## Setup

- GitHub user: `varna2026`, repo: `social-enterprise`
- Live URL: `https://varna2026.github.io/social-enterprise/`
- Static build output: `artifacts/social-map/dist/github-pages/`
- Data files: `artifacts/social-map/public/data/` (enterprises.json, events.json, images/)

## Key files

- `artifacts/social-map/vite.config.static.ts` — Vite config for static build. Uses alias to replace `@workspace/api-client-react` with local static hooks. Sets `base` from `GITHUB_REPO_NAME` env var. No PORT requirement.
- `artifacts/social-map/src/lib/static-api-client/index.ts` — Mock hooks that read from JSON. Includes stubs for mutation hooks (useCreateEnterprise etc.) so Admin.tsx compiles but is never reachable at runtime.
- `scripts/export-static.mjs` — Exports DB → JSON + downloads images from production URL. Uses pg via `lib/db/node_modules/pg/lib/index.js` (pg is not hoisted to root).
- `.github/workflows/deploy.yml` — GitHub Actions: install pnpm 9 + node 20 → build:static → deploy to Pages.

## Build command

```bash
GITHUB_REPO_NAME=social-enterprise pnpm --filter @workspace/social-map run build:static
```

## Update workflow (when data changes)

```bash
node scripts/export-static.mjs
git add artifacts/social-map/public/data/
git commit -m "Update data"
git push
```

**Why:** Static version reads from committed JSON files, not the live DB. Data must be re-exported and committed to appear on GitHub Pages.

## VITE_STATIC_MODE

Set to `"true"` via `define` in vite.config.static.ts. Controls:
- Hash routing (wouter/use-hash-location) instead of path routing
- Admin route hidden (`!IS_STATIC && <Route path="/admin">`)
- Admin button hidden in Navbar
