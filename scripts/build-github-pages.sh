#!/usr/bin/env bash
# Build complete GitHub Pages version.
# Run from workspace root: bash scripts/build-github-pages.sh
set -e

echo "=== Step 1: Export data from database ==="
node scripts/export-static.mjs

echo ""
echo "=== Step 2: Build static site ==="
GITHUB_REPO_NAME=social-enterprise pnpm --filter @workspace/social-map run build:static

echo ""
echo "=== Done! ==="
echo "Built files are in: artifacts/social-map/dist/github-pages/"
echo "Now commit and push to GitHub to trigger deployment."
