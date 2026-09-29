import type { InputHTMLAttributes } from "react";

import { t } from "./theme.ts";

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ color: t.muted, display: "block", fontSize: 12, marginBottom: 4 }}>
        {label}
      </span>
      <input
        {...props}
        style={{
          background: t.bg,
          border: `1px solid ${t.border}`,
          borderRadius: 6,
          color: t.text,
          fontFamily: t.mono,
          fontSize: 13,
          padding: "7px 10px",
          width: "100%",
          ...props.style,
        }}
      />
    </label>
  );
}
