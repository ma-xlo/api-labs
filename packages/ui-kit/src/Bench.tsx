import type { ReactNode } from "react";

import { t } from "./theme.ts";

/** Layout padrão de todo lab: título, features do roadmap, conteúdo. */
export function Bench({
  children,
  features = [],
  subtitle,
  title,
}: {
  children: ReactNode;
  features?: string[];
  subtitle?: string;
  title: string;
}) {
  return (
    <div
      style={{
        background: t.bg,
        color: t.text,
        font: `14px/1.5 system-ui, -apple-system, sans-serif`,
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
      <div style={{ margin: "0 auto", maxWidth: 940 }}>
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ color: t.muted, margin: "6px 0 0" }}>{subtitle}</p>}
          {features.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {features.map((f) => (
                <span
                  key={f}
                  style={{
                    background: t.panel,
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                    color: t.muted,
                    fontFamily: t.mono,
                    fontSize: 11,
                    padding: "2px 7px",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
