// Builds the extension popup and background worker. `--live` points them at the deployed Riven; otherwise the local server.
import { build } from "esbuild";

const api = process.argv.includes("--live") ? "https://riven.sbs/api/v1" : "http://127.0.0.1:3000/api/v1";
await build({
  entryPoints: { popup: "extension/src/popup.ts", background: "extension/src/background.ts" },
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "chrome120",
  outdir: "extension/dist",
  define: { __RIVEN_API__: JSON.stringify(api) },
});
console.log(`Extension built for ${api}`);
