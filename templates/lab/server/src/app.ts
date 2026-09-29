import { createApp, healthRouter } from "@labs/http-kit";
import { type Express } from "express";

import { env } from "./env.ts";

export function buildApp(): Express {
  const app = createApp({ trustProxy: true });

  app.use(healthRouter({ name: "__LAB_NAME__", version: "0.1.0" }));

  // Suas rotas aqui. Enquanto uma nao existe, a tela recebe 501 e diz isso
  // explicitamente em vez de um 404 generico.
  void env;

  return app;
}
