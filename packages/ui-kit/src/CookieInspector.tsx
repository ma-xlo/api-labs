import { useEffect, useState } from "react";

import { t } from "./theme.ts";

/**
 * Mostra o que `document.cookie` enxerga.
 *
 * Este componente é o argumento visual do lab http-only-login: enquanto a
 * sessão funciona perfeitamente, o cookie `sid` NÃO aparece aqui. É a diferença
 * entre ler "HttpOnly impede acesso por JavaScript" e ver o campo vazio com a
 * sessão ativa ao lado.
 */
export function CookieInspector({ pollMs = 1000 }: { pollMs?: number }) {
  const [raw, setRaw] = useState("");

  useEffect(() => {
    const read = () => setRaw(document.cookie);
    read();
    const id = setInterval(read, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  const cookies = raw
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div style={{ fontFamily: t.mono, fontSize: 12 }}>
      <div style={{ color: t.muted, marginBottom: 6 }}>document.cookie →</div>
      {cookies.length === 0 ? (
        <div style={{ color: t.good }}>
          (vazio) — nenhum cookie é legível por JavaScript nesta origem
        </div>
      ) : (
        cookies.map((c) => (
          <div key={c} style={{ color: t.warn }}>
            {c}
          </div>
        ))
      )}
    </div>
  );
}
