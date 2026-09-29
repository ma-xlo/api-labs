import { defineEnv, port, z } from "@labs/config";

/**
 * Validado na subida: o processo não aceita tráfego com config inválida.
 * Acrescente aqui tudo que o seu backend precisar (modo de CSRF, TTL de
 * sessão, escolha de store) — cada chave nova ganha validação de graça.
 */
export const env = defineEnv({
  CLIENT_ORIGIN: z.string().url().default("http://localhost:4001"),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: port().default(4000),
  REDIS_PREFIX: z.string().default("http_only_login:"),
  REDIS_URL: z.string().default("redis://localhost:6389"),
});

export type Env = typeof env;
