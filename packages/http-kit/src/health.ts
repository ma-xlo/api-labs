import { Router } from "express";

type Check = () => boolean | Promise<boolean>;

/**
 * F1.4 do roadmap: health e version.
 *
 * /health   — o processo está vivo (liveness). Nunca toca dependência.
 * /ready    — as dependências respondem (readiness). É este que o LB consulta.
 * /version  — o que exatamente está rodando aqui.
 */
export function healthRouter(opts: {
  checks?: Record<string, Check>;
  name: string;
  version?: string;
}): Router {
  const router = Router();
  const startedAt = Date.now();

  router.get("/health", (_req, res) => {
    res.json({ name: opts.name, status: "ok", uptimeMs: Date.now() - startedAt });
  });

  router.get("/ready", async (_req, res) => {
    const entries = Object.entries(opts.checks ?? {});
    const results = await Promise.all(
      entries.map(async ([key, check]) => {
        try {
          return [key, (await check()) ? "ok" : "fail"] as const;
        } catch {
          return [key, "fail"] as const;
        }
      }),
    );
    const ready = results.every(([, status]) => status === "ok");
    res.status(ready ? 200 : 503).json({ checks: Object.fromEntries(results), ready });
  });

  router.get("/version", (_req, res) => {
    res.json({
      name: opts.name,
      node: process.version,
      startedAt: new Date(startedAt).toISOString(),
      version: opts.version ?? "0.0.0",
    });
  });

  return router;
}
