import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres@127.0.0.1:55432/uzdfpro_test?schema=public";

export default function globalSetup(): void {
  const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

  execSync("npx prisma db push --skip-generate --force-reset", {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "pipe"
  });
}
