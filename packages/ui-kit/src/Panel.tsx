import type { ReactNode } from "react";

import { t } from "./theme.ts";

export function Panel({
  children,
  right,
  title,
}: {
  children: ReactNode;
  right?: ReactNode;
  title: string;
}) {
  return (
    <section
      style={{
        background: t.panel,
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <header
        style={{
          alignItems: "center",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 14px",
        }}
      >
        <strong style={{ fontSize: 13, letterSpacing: 0.3 }}>{title}</strong>
        {right}
      </header>
      <div style={{ padding: 14 }}>{children}</div>
    </section>
  );
}
