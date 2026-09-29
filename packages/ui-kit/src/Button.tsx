import type { ButtonHTMLAttributes } from "react";

import { t } from "./theme.ts";

export function Button({
  tone = "normal",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "danger" | "normal" | "primary" }) {
  const bg = tone === "primary" ? t.accent : tone === "danger" ? t.bad : "transparent";
  return (
    <button
      {...props}
      style={{
        background: bg,
        border: `1px solid ${tone === "normal" ? t.border : bg}`,
        borderRadius: 6,
        color: t.text,
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontSize: 13,
        opacity: props.disabled ? 0.5 : 1,
        padding: "6px 12px",
        ...props.style,
      }}
    />
  );
}
