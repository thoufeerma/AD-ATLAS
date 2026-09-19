// Runs the storefront suite, then the admin suite against the order it placed.
// Requires the API to be running (`npm run dev`). Development databases only.
//
// The admin suite signs in as a dedicated test account (smoke-admin-user.ts),
// switched on with a fresh random password for the run and off afterwards.
import { spawnSync } from "node:child_process";

const TSX = "node_modules/tsx/dist/cli.mjs";
const run = (file, args = [], env = process.env) =>
  spawnSync(process.execPath, [file, ...args], {
    encoding: "utf8",
    stdio: ["inherit", "pipe", "inherit"],
    env,
  });

const pub = run("scripts/smoke-public.mjs");
process.stdout.write(pub.stdout);
const order = pub.stdout.match(/PLACED_ORDER=(\S+)/)?.[1];

if (pub.status !== 0 || !order || order === "undefined") {
  console.error("\nStorefront suite failed — skipping admin suite.");
  process.exit(pub.status || 1);
}

const enable = run(TSX, ["scripts/smoke-admin-user.ts", "enable"]);
const password = enable.stdout.match(/SMOKE_ADMIN_PASSWORD=(\S+)/)?.[1];
if (enable.status !== 0 || !password) {
  console.error("\nCould not set up the test admin account — skipping admin suite.");
  process.exit(enable.status || 1);
}

let status = 1;
try {
  const admin = run("scripts/smoke-admin.mjs", [order], {
    ...process.env,
    SMOKE_ADMIN_EMAIL: "smoke-runner@velastia.test",
    SMOKE_ADMIN_PASSWORD: password,
  });
  process.stdout.write(admin.stdout);
  status = admin.status ?? 1;
} finally {
  run(TSX, ["scripts/smoke-admin-user.ts", "disable"]);
}
process.exit(status);
