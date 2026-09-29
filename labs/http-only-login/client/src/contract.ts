/**
 * O contrato que esta tela espera do seu backend.
 *
 * Está documentado por extenso no README do lab. Implemente contra isto e a
 * tela funciona de primeira; mude aqui se decidir mudar o contrato.
 */

export type Me = {
  createdAt: string;
  email: string;
  id: string;
};

export type Session = {
  createdAt: string;
  /** `true` na sessão que está fazendo esta requisição — a tela a destaca. */
  current: boolean;
  id: string;
  ip: null | string;
  lastSeenAt: string;
  userAgent: null | string;
};

export type ApiError = {
  code: string;
  message: string;
};

/** Endpoints que a tela chama, na ordem em que vale implementar. */
export const ENDPOINTS = [
  { method: "POST", path: "/auth/register", why: "cria conta" },
  { method: "POST", path: "/auth/login", why: "autentica e rotaciona o id da sessão" },
  { method: "GET", path: "/auth/me", why: "quem sou eu, ou 401" },
  { method: "GET", path: "/auth/csrf", why: "token sincronizador" },
  { method: "POST", path: "/auth/logout", why: "encerra esta sessão" },
  { method: "POST", path: "/auth/logout-all", why: "encerra todas" },
  { method: "GET", path: "/auth/sessions", why: "dispositivos ativos" },
  { method: "DELETE", path: "/auth/sessions/:id", why: "revoga um dispositivo" },
] as const;
