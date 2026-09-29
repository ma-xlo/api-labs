import { Button, Panel } from "@labs/ui-kit";

import type { Session } from "../contract.ts";
import type { useAuthApi } from "../useAuthApi.ts";

type Props = {
  api: ReturnType<typeof useAuthApi>;
  enabled: boolean;
  onChange: () => Promise<void>;
  sessions: Session[];
};

/**
 * A lista de dispositivos é o que torna "sessão no servidor" palpável.
 *
 * Abra uma segunda janela anônima, faça login, e veja duas linhas aqui.
 * Revogue uma: a outra janela cai na requisição SEGUINTE, sem esperar
 * expiração nenhuma. Isso é a vantagem operacional que um JWT não tem.
 */
export function SessionsPanel({ api, enabled, onChange, sessions }: Props) {
  if (!enabled) return null;

  return (
    <Panel
      right={<small style={{ color: "#8b93a7" }}>{sessions.length} ativa(s)</small>}
      title="Dispositivos conectados"
    >
      {sessions.length === 0 ? (
        <p style={{ color: "#8b93a7", fontSize: 13, margin: 0 }}>
          Nenhuma sessão listada. Implemente <code>GET /auth/sessions</code> para preencher isto.
        </p>
      ) : (
        <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
          <thead>
            <tr style={{ color: "#8b93a7", textAlign: "left" }}>
              <th style={th}>Dispositivo</th>
              <th style={th}>IP</th>
              <th style={th}>Último acesso</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} style={{ borderTop: "1px solid #2a2f3a" }}>
                <td style={td}>
                  {session.current && <span style={{ color: "#16a34a", marginRight: 6 }}>●</span>}
                  <span title={session.userAgent ?? ""}>{shortAgent(session.userAgent)}</span>
                </td>
                <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>
                  {session.ip ?? "—"}
                </td>
                <td style={td}>{when(session.lastSeenAt)}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  <Button
                    onClick={async () => {
                      await api.revoke(session.id);
                      await onChange();
                    }}
                    style={{ fontSize: 11, padding: "3px 8px" }}
                    tone={session.current ? "normal" : "danger"}
                  >
                    {session.current ? "sair" : "revogar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: "#8b93a7", fontSize: 12, margin: "14px 0 0" }}>
        Abra uma janela anônima e entre de novo: deve aparecer uma segunda linha. Revogue-a e
        recarregue a outra janela — ela cai na requisição seguinte, não na expiração.
      </p>
    </Panel>
  );
}

const th = { fontWeight: 500, padding: "0 8px 8px 0" } as const;
const td = { padding: "8px 8px 8px 0" } as const;

function shortAgent(agent: null | string): string {
  if (!agent) return "desconhecido";
  const match = /(Firefox|Chrome|Safari|Edg)\/[\d.]+/.exec(agent);
  return match ? match[1]! : `${agent.slice(0, 28)}…`;
}

function when(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min atrás`;
  return new Date(iso).toLocaleString("pt-BR");
}
