import { t } from "./theme.ts";

export function JsonView({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        color: t.text,
        fontFamily: t.mono,
        fontSize: 12,
        margin: 0,
        overflowX: "auto",
        padding: 10,
      }}
    >
      {value === undefined ? "—" : JSON.stringify(value, null, 2)}
    </pre>
  );
}
