import { spawn } from "node:child_process";

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "Set TEST_DATABASE_URL in .env before running integration tests.",
  );
}

const integrationTests = [
  "server/auth.integration.test.ts",
  "server/data/seed.integration.test.ts",
];

const child = spawn(
  process.execPath,
  [
    "node_modules/vitest/vitest.mjs",
    "run",
    ...integrationTests,
  ],
  {
    stdio: "inherit",
  },
);

child.on("error", () => {
  console.error("Could not start integration tests.");
  process.exitCode = 1;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});