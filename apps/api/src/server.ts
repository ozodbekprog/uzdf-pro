import { buildApp } from "./app.js";
import { env } from "./env.js";

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    app.log.info({ signal }, "Server to'xtatilmoqda");
    await app.close();
    process.exit(0);
  });
}
