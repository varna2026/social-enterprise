import { Router } from "express";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/download-github-pages", (req, res) => {
  const distDir = path.resolve(
    __dirname,
    "../../../artifacts/social-map/dist/github-pages"
  );

  if (!fs.existsSync(distDir)) {
    return res.status(404).json({ error: "Build not found.", path: distDir });
  }

  const archivePath = "/tmp/github-pages.tar.gz";

  try {
    execSync(`tar -czf "${archivePath}" -C "${distDir}" .`, { stdio: "pipe" });
  } catch (err) {
    return res.status(500).json({ error: "Could not create archive" });
  }

  res.setHeader("Content-Disposition", "attachment; filename=github-pages.tar.gz");
  res.setHeader("Content-Type", "application/gzip");
  res.sendFile(archivePath);
});

export default router;
