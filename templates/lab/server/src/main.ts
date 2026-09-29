import { startServer } from "@labs/http-kit";

import { buildApp } from "./app.ts";
import { env } from "./env.ts";

await startServer(buildApp(), { name: "__LAB_NAME__", port: env.PORT });
