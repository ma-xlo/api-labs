import { defineEnv, port, z } from "@labs/config";

export const env = defineEnv({
  CLIENT_ORIGIN: z.string().url().default("http://localhost:__CLIENT_PORT__"),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: port().default(__SERVER_PORT__),
});

export type Env = typeof env;
