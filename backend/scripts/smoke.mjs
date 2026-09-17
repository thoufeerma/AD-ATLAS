// Runs the storefront suite, then the admin suite against the order it placed.
// Requires the API to be running (`npm run dev`). Development databases only.
import { spawnSync } from "node:child_process";

const run = (file, args = []) =>
  spawnSync(process.execPath, [file, ...args], { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] });

const pub = run("scripts/smoke-public.mjs");
process.stdout.write(pub.stdout);
const order = pub.stdout.match(/PLACED_ORDER=(\S+)/)?.[1];

if (pub.status !== 0 || !order || order === "undefined") {
  console.error("\nStorefront suite failed — skipping admin suite.");
  process.exit(pub.status || 1);
}

const admin = run("scripts/smoke-admin.mjs", [order]);
process.stdout.write(admin.stdout);
process.exit(admin.status ?? 1);
