// Builds the extension popup. `--live` points it at the deployed Riven; otherwise the local server.
import { build } from "esbuild";

const api = process.argv.includes("--live") ? "https://riven.sbs/api/v1" : "http://127.0.0.1:3000/api/v1";
await build({
  entryPoints: ["extension/src/popup.ts"],
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "chrome120",
  outfile: "extension/dist/popup.js",
  define: { __RIVEN_API__: JSON.stringify(api) },
});
console.log(`Extension built for ${api}`);
