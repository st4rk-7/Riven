import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
const path = new URL("../.env", import.meta.url);
const text = await readFile(path, "utf8");
const line = /^BETTER_AUTH_SECRET=(.*)$/m;
if (line.exec(text)?.[1].trim()) {
  console.log("Keeping the existing BETTER_AUTH_SECRET in .env.");
} else {
  const secret = `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`;
  await writeFile(path, line.test(text) ? text.replace(line, secret) : `${text.trimEnd()}\n${secret}\n`);
  console.log("Generated BETTER_AUTH_SECRET in .env; the value was not printed.");
}
