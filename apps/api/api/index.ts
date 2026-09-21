import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../dist/app.js";

let appPromise: ReturnType<typeof buildApp> | null = null;

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  appPromise ??= buildApp();
  const app = await appPromise;
  await app.ready();
  app.server.emit("request", request, response);
}
