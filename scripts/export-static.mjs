#!/usr/bin/env node
/**
 * Export static data for GitHub Pages build.
 *
 * Usage (from workspace root):
 *   node scripts/export-static.mjs
 *
 * Fetches data from the production Replit deployment API.
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DATA = path.join(ROOT, "artifacts/social-map/public/data");
const IMAGES_DIR = path.join(PUBLIC_DATA, "images");

const PROD_URL = "https://social-enterprise-north.replit.app";

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = lib.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fsp
          .unlink(dest)
          .catch(() => {})
          .then(() => downloadFile(res.headers.location, dest))
          .then(resolve)
          .catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fsp.unlink(dest).catch(() => {});
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", (err) => {
        fsp.unlink(dest).catch(() => {});
        reject(err);
      });
    });
    req.on("error", (err) => {
      file.close();
      fsp.unlink(dest).catch(() => {});
      reject(err);
    });
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { Accept: "application/json" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchJson(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
  });
}

async function main() {
  console.log("📦 Exporting static data for GitHub Pages...\n");
  console.log(`📡 Source: ${PROD_URL}\n`);

  await fsp.mkdir(PUBLIC_DATA, { recursive: true });
  await fsp.mkdir(IMAGES_DIR, { recursive: true });

  console.log("🗄️  Fetching enterprises from production API...");
  const enterprises = await fetchJson(`${PROD_URL}/api/enterprises?limit=1000`);
  console.log(`   Found ${enterprises.length} enterprises`);

  console.log("🗄️  Fetching events from production API...");
  let events = [];
  try {
    events = await fetchJson(`${PROD_URL}/api/events?limit=1000`);
    console.log(`   Found ${events.length} events`);
  } catch {
    console.log("   No events endpoint or 0 events");
  }

  console.log("\n🖼️  Downloading images...");
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const enterprise of enterprises) {
    const rawImages = enterprise.images;
    if (!rawImages) continue;
    let imageUrls;
    try {
      imageUrls =
        typeof rawImages === "string" ? JSON.parse(rawImages) : rawImages;
    } catch {
      continue;
    }
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) continue;

    for (const imgUrl of imageUrls) {
      if (!imgUrl || !imgUrl.includes("/api/storage/objects/uploads/"))
        continue;
      const uuid = imgUrl.split("/").pop();
      if (!uuid) continue;
      const destFile = path.join(IMAGES_DIR, uuid);

      try {
        await fsp.access(destFile);
        skipped++;
        continue;
      } catch {
        // File doesn't exist — download it
      }

      try {
        const fullUrl = imgUrl.startsWith("http")
          ? imgUrl
          : `${PROD_URL}${imgUrl}`;
        await downloadFile(fullUrl, destFile);
        downloaded++;
        process.stdout.write(
          `   ✓ ${enterprise.naimenovanie} (${uuid.slice(0, 8)}…)\n`
        );
      } catch (err) {
        failed++;
        console.warn(`   ✗ Failed ${uuid.slice(0, 8)}… — ${err.message}`);
      }
    }
  }

  console.log(
    `\n   Images: ${downloaded} downloaded, ${skipped} already cached, ${failed} failed`
  );

  const oblastNorm = {
    "Varna": "Варна",
    "Dobrich": "Добрич",
    "Shumen": "Шумен",
    "Targovishte": "Търговище",
    "Търговище ": "Търговище",
    "Варна ": "Варна",
  };
  const normalized = enterprises.map((e) => ({
    ...e,
    oblast: oblastNorm[e.oblast] ?? e.oblast,
  }));

  console.log("\n💾 Writing enterprises.json...");
  await fsp.writeFile(
    path.join(PUBLIC_DATA, "enterprises.json"),
    JSON.stringify(normalized, null, 2),
    "utf-8"
  );

  console.log("💾 Writing events.json...");
  await fsp.writeFile(
    path.join(PUBLIC_DATA, "events.json"),
    JSON.stringify(events, null, 2),
    "utf-8"
  );

  const imageFiles = await fsp.readdir(IMAGES_DIR);

  console.log("\n✅ Export complete!");
  console.log(
    `   artifacts/social-map/public/data/enterprises.json — ${enterprises.length} records`
  );
  console.log(
    `   artifacts/social-map/public/data/events.json      — ${events.length} records`
  );
  console.log(
    `   artifacts/social-map/public/data/images/          — ${imageFiles.length} files`
  );
}

main().catch((err) => {
  console.error("\n❌ Export failed:", err.message);
  process.exit(1);
});
