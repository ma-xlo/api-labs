import { createApp, healthRouter } from "@labs/http-kit";
import cookieParser from "cookie-parser";
import cors from "cors";
import { type Express } from "express";

import { env } from "./env.ts";

/**
 * O app, montado mas vazio. Tudo que este lab ensina você escreve a partir
 * daqui — o contrato exato dos endpoints está no README.
 *
 * O CORS já vem configurado porque sem ele NADA funciona entre :4001 e :4000,
 * e você perderia a primeira hora num 401 que parece bug de sessão. Repare em
 * `credentials: true` e na origem explícita: `origin: "*"` é incompatível com
 * credenciais, e o navegador recusa a combinação sem dizer o porquê.
 */
export function buildApp(): Express {
  const app = createApp({ trustProxy: true });

  app.use(cors({ credentials: true, origin: [env.CLIENT_ORIGIN] }));
  app.use(cookieParser());

  app.use(healthRouter({ name: "http-only-login", version: "0.1.0" }));

  // ────────────────────────────────────────────────────────────────────
  // Daqui para baixo é seu. Ordem sugerida (ver README):
  //   1. POST /auth/register
  //   2. POST /auth/login          ← rotacionar o id da sessão aqui
  //   3. GET  /auth/me
  //   4. POST /auth/logout, /auth/logout-all
  //   5. GET  /auth/sessions, DELETE /auth/sessions/:id
  //   6. GET  /auth/csrf           ← e o middleware que o exige
  //   7. GET  /lab/cookies/set     ← o laboratório de flags (F1.7)
  // ────────────────────────────────────────────────────────────────────

  // Enquanto uma rota não existe, a tela recebe 501 e mostra "não implementado"
  // em vez de um 404 genérico. Apague esta linha quando terminar.
  app.use("/auth", (_req, res) => {
    res.status(501).json({ code: "not_implemented", message: "Endpoint ainda não implementado" });
  });

  return app;
}
