import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const repoName = process.env.GITHUB_REPO_NAME ?? "";
const base = repoName ? `/${repoName}/` : "./";

export default defineConfig({
  base,
  define: {
    "import.meta.env.VITE_STATIC_MODE": JSON.stringify("true"),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@workspace/api-client-react/src",
        replacement: path.resolve(
          import.meta.dirname,
          "../../lib/api-client-react/src"
        ),
      },
      {
        find: "@workspace/api-client-react",
        replacement: path.resolve(
          import.meta.dirname,
          "src/lib/static-api-client/index.ts"
        ),
      },
      {
        find: "@",
        replacement: path.resolve(import.meta.dirname, "src"),
      },
      {
        find: "@assets",
        replacement: path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets"
        ),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/github-pages"),
    emptyOutDir: true,
  },
});
