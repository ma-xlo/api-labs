import { Bench, Panel } from "@labs/ui-kit";
import { useCallback, useEffect, useState } from "react";

import type { Me, Session } from "./contract.ts";

import { AttackPanel } from "./panels/AttackPanel.tsx";
import { AuthPanel } from "./panels/AuthPanel.tsx";
import { CookiePanel } from "./panels/CookiePanel.tsx";
import { LogPanel } from "./panels/LogPanel.tsx";
import { SessionsPanel } from "./panels/SessionsPanel.tsx";
import { useAuthApi } from "./useAuthApi.ts";

export function App() {
  const api = useAuthApi();
  const [me, setMe] = useState<Me | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const refresh = useCallback(async () => {
    const result = await api.me();
    setMe(result.ok ? result.data : null);

    if (result.ok) {
      const list = await api.sessions();
      setSessions(list.ok ? list.data : []);
    } else {
      setSessions([]);
    }
  }, [api]);

  // Carga inicial. O setState acontece dentro da promise, nao no corpo do
  // efeito — a regra nao consegue ver isso atraves do useCallback.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) await refresh();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Bench
      features={["F9.1", "F9.2", "F9.4*", "F1.7", "F9.12", "F9.13"]}
      subtitle="Sessão no servidor, cookie que o JavaScript não enxerga, e um site atacante para provar que a defesa de CSRF é real."
      title="http-only-login"
    >
      <AuthPanel api={api} me={me} onChange={refresh} />

      <SessionsPanel api={api} enabled={Boolean(me)} onChange={refresh} sessions={sessions} />

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        <CookiePanel />
        <AttackPanel />
      </div>

      <Panel right={<small style={{ color: "#8b93a7" }}>últimas 50</small>} title="Requisições">
        <LogPanel entries={api.log} />
      </Panel>
    </Bench>
  );
}
