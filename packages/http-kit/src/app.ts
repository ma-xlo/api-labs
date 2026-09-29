import express, { type Express } from "express";

/**
 * O mínimo que TODO lab repete e NENHUM lab existe para ensinar.
 *
 * Deliberadamente ausentes, porque cada um é o assunto de um lab:
 * taxonomia de erro / problem+json, request-id, logging correlacionado,
 * CORS, autenticação, CSRF, rate limiting, cache, paginação, idempotência.
 *
 * Se você sentir vontade de adicionar algo aqui "porque dois labs usam",
 * releia docs/convencoes.md. Duplicação entre labs é o produto.
 */
export function createApp(opts: { jsonLimit?: string; trustProxy?: boolean } = {}): Express {
  const app = express();

  // Não anuncie a stack. Grátis, e o scanner do Stage 9 vai reclamar se faltar.
  app.disable("x-powered-by");

  if (opts.trustProxy) app.set("trust proxy", 1);

  app.use(express.json({ limit: opts.jsonLimit ?? "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: opts.jsonLimit ?? "100kb" }));

  return app;
}
