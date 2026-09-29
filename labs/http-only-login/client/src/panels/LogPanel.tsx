import { type LogEntry, RequestLog } from "@labs/ui-kit";

export function LogPanel({ entries }: { entries: LogEntry[] }) {
  const notImplemented = entries.filter((e) => e.status === 501).length;

  return (
    <>
      <RequestLog entries={entries} />
      {notImplemented > 0 && (
        <p style={{ color: "#d97706", fontSize: 12, margin: "12px 0 0" }}>
          {notImplemented} chamada(s) voltaram 501 — o endpoint ainda não existe no servidor. O
          contrato completo está no README do lab.
        </p>
      )}
    </>
  );
}
