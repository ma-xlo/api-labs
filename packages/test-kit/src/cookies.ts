import { expect } from "vitest";

export type ParsedCookie = {
  httpOnly: boolean;
  maxAge?: number;
  name: string;
  path?: string;
  raw: string;
  sameSite?: "lax" | "none" | "strict";
  secure: boolean;
  value: string;
};

/**
 * Parser de `Set-Cookie`.
 *
 * Isto pode ser compartilhado porque é ASSERÇÃO, não implementação: o lab
 * continua tendo que escrever os `Set-Cookie` sozinho. O que o kit oferece é
 * uma forma de provar que as flags saíram exatamente como se pretendia — que
 * é a diferença entre "eu acho que é HttpOnly" e F1.7 fechado.
 */
export function parseSetCookie(header: string | string[] | undefined): ParsedCookie[] {
  const headers = Array.isArray(header) ? header : header ? [header] : [];

  return headers.map((raw) => {
    const [pair, ...attrs] = raw.split(";").map((s) => s.trim());
    const eq = pair!.indexOf("=");
    const cookie: ParsedCookie = {
      httpOnly: false,
      name: pair!.slice(0, eq),
      raw,
      secure: false,
      value: decodeURIComponent(pair!.slice(eq + 1)),
    };

    for (const attr of attrs) {
      const [key, val] = attr.split("=").map((s) => s.trim());
      switch (key!.toLowerCase()) {
        case "httponly":
          cookie.httpOnly = true;
          break;
        case "max-age":
          cookie.maxAge = Number(val);
          break;
        case "path":
          if (val !== undefined) cookie.path = val;
          break;
        case "samesite":
          if (val !== undefined) {
            cookie.sameSite = val.toLowerCase() as NonNullable<ParsedCookie["sameSite"]>;
          }
          break;
        case "secure":
          cookie.secure = true;
          break;
      }
    }
    return cookie;
  });
}

/** Asserta as flags de um cookie específico numa resposta do supertest. */
export function expectCookieFlags(
  res: { headers: Record<string, string | string[] | undefined> },
  name: string,
  expected: Partial<Omit<ParsedCookie, "name" | "raw">>,
): ParsedCookie {
  const cookies = parseSetCookie(res.headers["set-cookie"]);
  const cookie = cookies.find((c) => c.name === name);

  expect(
    cookie,
    `nenhum Set-Cookie chamado "${name}". Recebidos: ${cookies.map((c) => c.name).join(", ") || "(nenhum)"}`,
  ).toBeDefined();

  for (const [key, want] of Object.entries(expected)) {
    expect(cookie![key as keyof ParsedCookie], `cookie "${name}", atributo "${key}"`).toBe(want);
  }
  return cookie!;
}
