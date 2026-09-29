import { useApi } from "@labs/ui-kit";
import { useCallback, useMemo, useRef } from "react";

import type { Me, Session } from "./contract.ts";

const BASE = import.meta.env["VITE_DIRECT_API"] === "1" ? "http://localhost:4000" : "/api";

/**
 * Cliente da API deste lab.
 *
 * Duas coisas que importam e são fáceis de errar:
 *
 * 1. `credentials: "include"` em TODA chamada (está dentro do useApi). Sem
 *    isso o cookie não viaja e você depura um 401 que parece bug de servidor.
 *
 * 2. O token de CSRF vai no header `X-CSRF-Token`, nunca no corpo. Ele é lido
 *    do cookie `csrf` — que é o único cookie deste lab SEM HttpOnly,
 *    justamente porque o JavaScript precisa lê-lo.
 */
export function useAuthApi() {
  const csrf = useRef<string | undefined>(undefined);

  const readCsrfCookie = useCallback(() => {
    const match = /(?:^|;\s*)csrf=([^;]*)/.exec(document.cookie);
    if (match) csrf.current = decodeURIComponent(match[1]!);
    return csrf.current;
  }, []);

  const api = useApi(BASE, readCsrfCookie);

  return useMemo(
    () => ({
      clear: api.clear,
      csrf: () => api.get<{ token: string }>("/auth/csrf"),

      log: api.log,
      login: (email: string, password: string) =>
        api.post<null>("/auth/login", { email, password }),
      logout: () => api.post<null>("/auth/logout"),
      logoutAll: () => api.post<null>("/auth/logout-all"),
      me: () => api.get<Me>("/auth/me"),
      register: (email: string, password: string) =>
        api.post<Me>("/auth/register", { email, password }),
      revoke: (id: string) => api.del<null>(`/auth/sessions/${id}`),
      sessions: () => api.get<Session[]>("/auth/sessions"),
    }),
    [api],
  );
}
