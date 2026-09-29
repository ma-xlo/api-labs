import { useCallback, useRef, useState } from "react";

import type { LogEntry } from "./RequestLog.tsx";

export type Api = {
  clear: () => void;
  del: <T>(path: string) => Promise<Result<T>>;
  get: <T>(path: string) => Promise<Result<T>>;
  log: LogEntry[];
  post: <T>(path: string, body?: unknown) => Promise<Result<T>>;
};

/** `status` nos DOIS ramos: 201 vs 204 muda o que a tela faz depois. */
export type Result<T> =
  { data: T; ok: true; status: number } | { error: unknown; ok: false; status: number };

/**
 * fetch com `credentials: "include"` SEMPRE, e cada chamada alimenta o log.
 *
 * `credentials: "include"` é o detalhe que decide se o cookie de sessão viaja.
 * Está embutido aqui porque esquecê-lo produz um 401 que parece bug de backend
 * e custa uma hora — e porque o lab que ensina isso é o de CORS, não os outros 21.
 */
export function useApi(baseUrl = "/api", csrfHeader?: () => string | undefined): Api {
  const [log, setLog] = useState<LogEntry[]>([]);
  const seq = useRef(0);

  const call = useCallback(
    async <T>(method: string, path: string, body?: unknown): Promise<Result<T>> => {
      const started = performance.now();
      const url = `${baseUrl}${path}`;
      const headers: Record<string, string> = {};
      if (body !== undefined) headers["Content-Type"] = "application/json";

      const token = csrfHeader?.();
      if (token && method !== "GET") headers["X-CSRF-Token"] = token;

      try {
        const init: RequestInit = { credentials: "include", headers, method };
        if (body !== undefined) init.body = JSON.stringify(body);

        const res = await fetch(url, init);

        const text = await res.text();
        const parsed: unknown = text ? safeJson(text) : null;

        setLog((prev) => [
          {
            csrfSent: Boolean(token) && method !== "GET",
            durationMs: Math.round(performance.now() - started),
            id: ++seq.current,
            method,
            // O navegador esconde Set-Cookie de HttpOnly do JS por design.
            // Só conseguimos observar que a resposta veio, nunca o valor.
            status: res.status,
            url,
          },
          ...prev.slice(0, 49),
        ]);

        if (!res.ok) return { error: parsed, ok: false, status: res.status };
        return { data: parsed as T, ok: true, status: res.status };
      } catch (error) {
        setLog((prev) => [
          {
            durationMs: Math.round(performance.now() - started),
            id: ++seq.current,
            method,
            networkError: String(error),
            status: 0,
            url,
          },
          ...prev.slice(0, 49),
        ]);
        return { error, ok: false, status: 0 };
      }
    },
    [baseUrl, csrfHeader],
  );

  return {
    clear: () => setLog([]),
    del: (path) => call("DELETE", path),
    get: (path) => call("GET", path),
    log,
    post: (path, body) => call("POST", path, body),
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
