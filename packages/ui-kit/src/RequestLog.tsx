import { t } from "./theme.ts";

export type LogEntry = {
  csrfSent?: boolean;
  durationMs: number;
  id: number;
  method: string;
  networkError?: string;
  status: number;
  url: string;
};

export function RequestLog({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) {
    return <p style={{ color: t.muted, fontSize: 13, margin: 0 }}>Nenhuma requisição ainda.</p>;
  }

  return (
    <div style={{ fontFamily: t.mono, fontSize: 12 }}>
      {entries.map((e) => (
        <div
          key={e.id}
          style={{
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            gap: 10,
            padding: "5px 0",
          }}
        >
          <span style={{ color: t.muted, width: 52 }}>{e.method}</span>
          <span
            style={{
              color: e.status === 0 ? t.bad : e.status < 400 ? t.good : t.warn,
              width: 34,
            }}
          >
            {e.status || "ERR"}
          </span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{e.url}</span>
          {e.csrfSent && <span style={{ color: t.accent }}>+csrf</span>}
          <span style={{ color: t.muted }}>{e.durationMs}ms</span>
        </div>
      ))}
    </div>
  );
}
