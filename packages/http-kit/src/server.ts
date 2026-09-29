import type { Express } from "express";
import type { Server } from "node:http";

import { logger } from "./logger.ts";

export type RunningServer = { close: () => Promise<void>; server: Server };

/**
 * Sobe o servidor e desliga sem derrubar requisição em voo.
 *
 * `server.close()` para de aceitar conexões novas e espera as abertas
 * terminarem. O timeout existe porque uma conexão keep-alive ociosa
 * nunca termina sozinha — sem ele o processo pendura para sempre.
 */
export function startServer(
  app: Express,
  opts: { name: string; onShutdown?: () => Promise<void>; port: number; timeoutMs?: number },
): Promise<RunningServer> {
  const log = logger(opts.name);

  return new Promise((resolve) => {
    const server = app.listen(opts.port, () => {
      log.info(`lab "${opts.name}" ouvindo em http://localhost:${opts.port}`);

      const close = () =>
        new Promise<void>((done) => {
          const forced = setTimeout(() => {
            log.warn("shutdown forçado: conexões ainda abertas após o timeout");
            done();
          }, opts.timeoutMs ?? 5_000);

          server.close(() => {
            clearTimeout(forced);
            void Promise.resolve(opts.onShutdown?.()).then(() => done());
          });
          // Encerra keep-alives ociosos, que nunca fechariam por conta própria.
          server.closeIdleConnections?.();
        });

      for (const signal of ["SIGINT", "SIGTERM"] as const) {
        process.once(signal, () => {
          log.info(`${signal} recebido, desligando`);
          void close().then(() => process.exit(0));
        });
      }

      resolve({ close, server });
    });
  });
}
