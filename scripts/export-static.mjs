#!/usr/bin/env node
/**
 * Export static data for GitHub Pages build.
 *
 * Usage (from workspace root):
 *   node scripts/export-static.mjs
 *
 * Requires DATABASE_URL env var (set automatically in Replit).
 * Downloads images from the production Replit deployment.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pg = require(
  new URL("../lib/db/node_modules/pg/lib/index.js", import.meta.url).pathname
);
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

const { Pool } = pg;

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

async function main() {
  console.log("📦 Exporting static data for GitHub Pages...\n");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  await fsp.mkdir(PUBLIC_DATA, { recursive: true });
  await fsp.mkdir(IMAGES_DIR, { recursive: true });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("🗄️  Querying enterprises...");
    const { rows: enterprises } = await pool.query(
      "SELECT * FROM enterprises ORDER BY id"
    );
    console.log(`   Found ${enterprises.length} enterprises`);

    console.log("🗄️  Querying events...");
    const { rows: events } = await pool.query(
      "SELECT * FROM events ORDER BY id"
    );
    console.log(`   Found ${events.length} events`);

    console.log("\n🖼️  Downloading images...");
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const enterprise of enterprises) {
      if (!enterprise.images) continue;
      let imageUrls;
      try {
        imageUrls =
          typeof enterprise.images === "string"
            ? JSON.parse(enterprise.images)
            : enterprise.images;
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
          const fullUrl = `${PROD_URL}${imgUrl}`;
          await downloadFile(fullUrl, destFile);
          downloaded++;
          process.stdout.write(`   ✓ ${enterprise.naimenovanie} (${uuid.slice(0, 8)}…)\n`);
        } catch (err) {
          failed++;
          console.warn(
            `   ✗ Failed ${uuid.slice(0, 8)}… — ${err.message}`
          );
        }
      }
    }

    console.log(
      `\n   Images: ${downloaded} downloaded, ${skipped} already cached, ${failed} failed`
    );

    function snakeToCamel(str) {
      return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    }

    const FIELD_RENAMES = {
      sotsialnaKauza: "socialnaKauza",
      sotsialnaInovaciya: "socialnaInovaciya",
    };

    function convertRow(row) {
      return Object.fromEntries(
        Object.entries(row).map(([k, v]) => {
          const camel = snakeToCamel(k);
          return [FIELD_RENAMES[camel] ?? camel, v];
        })
      );
    }

    const enterprisesCamel = enterprises.map(convertRow);
    const eventsCamel = events.map(convertRow);

    console.log("\n💾 Writing enterprises.json...");
    await fsp.writeFile(
      path.join(PUBLIC_DATA, "enterprises.json"),
      JSON.stringify(enterprisesCamel, null, 2),
      "utf-8"
    );

    console.log("💾 Writing events.json...");
    await fsp.writeFile(
      path.join(PUBLIC_DATA, "events.json"),
      JSON.stringify(eventsCamel, null, 2),
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
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\n❌ Export failed:", err.message);
  process.exit(1);
});
