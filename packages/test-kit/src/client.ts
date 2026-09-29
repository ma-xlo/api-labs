import type { Express } from "express";

import request from "supertest";

import { parseSetCookie } from "./cookies.ts";

export type CookieAwareClient = {
  /** Os cookies que este "navegador" guarda no momento. */
  cookies: () => Record<string, string>;
  del: (path: string) => request.Test;
  get: (path: string) => request.Test;
  post: (path: string, body?: unknown) => request.Test;
  /** Descarta os cookies — simula uma janela anônima. */
  reset: () => void;
};

/**
 * Supertest com jar de cookies persistente entre chamadas.
 *
 * Sem isto, testar sessão é impossível: cada `request(app)` do supertest é um
 * cliente novo, sem memória. Instanciar dois `apiClient` é como abrir o site em
 * dois dispositivos — que é exatamente o que "sair de todos os dispositivos"
 * precisa para ser testado de verdade.
 */
export function apiClient(app: Express): CookieAwareClient {
  let jar: Record<string, string> = {};

  const serialize = () =>
    Object.entries(jar)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("; ");

  const absorb = (res: request.Response) => {
    for (const cookie of parseSetCookie(res.headers["set-cookie"])) {
      // Max-Age=0 é como o servidor apaga um cookie. O jar precisa obedecer,
      // senão o teste de logout "passa" continuando a mandar o cookie morto.
      if (cookie.maxAge === 0 || cookie.value === "") delete jar[cookie.name];
      else jar[cookie.name] = cookie.value;
    }
    return res;
  };

  const send = (test: request.Test) => {
    const cookies = serialize();
    if (cookies) test.set("Cookie", cookies);
    void test.then(absorb, () => undefined);
    return test;
  };

  return {
    cookies: () => ({ ...jar }),
    del: (path) => send(request(app).delete(path)),
    get: (path) => send(request(app).get(path)),
    post: (path, body) =>
      send(
        body === undefined
          ? request(app).post(path)
          : request(app)
              .post(path)
              .send(body as object),
      ),
    reset: () => {
      jar = {};
    },
  };
}
