import { Button, Field, JsonView, Panel, type Result } from "@labs/ui-kit";
import { useState } from "react";

import type { Me } from "../contract.ts";
import type { useAuthApi } from "../useAuthApi.ts";

type Props = {
  api: ReturnType<typeof useAuthApi>;
  me: Me | null;
  onChange: () => Promise<void>;
};

export function AuthPanel({ api, me, onChange }: Props) {
  const [email, setEmail] = useState("ana@exemplo.com");
  const [password, setPassword] = useState("senha-muito-longa-e-boba");
  const [feedback, setFeedback] = useState<null | { kind: "bad" | "good"; text: string }>(null);
  const [busy, setBusy] = useState(false);

  const act = async (label: string, run: () => Promise<Result<unknown>>) => {
    setBusy(true);
    setFeedback(null);
    const result = await run();
    setBusy(false);

    if (result.ok) {
      setFeedback({ kind: "good", text: `${label}: ok` });
    } else if (result.status === 501) {
      setFeedback({ kind: "bad", text: `${label}: endpoint ainda não implementado no servidor` });
    } else {
      const message =
        (result.error as null | { message?: string })?.message ?? `HTTP ${result.status}`;
      setFeedback({ kind: "bad", text: `${label}: ${message}` });
    }
    await onChange();
  };

  if (me) {
    return (
      <Panel
        right={<span style={{ color: "#16a34a", fontSize: 12 }}>autenticado</span>}
        title="Sessão"
      >
        <JsonView value={me} />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button disabled={busy} onClick={() => void act("logout", api.logout)}>
            Sair
          </Button>
          <Button
            disabled={busy}
            onClick={() => void act("logout-all", api.logoutAll)}
            tone="danger"
          >
            Sair de todos os dispositivos
          </Button>
        </div>
        {feedback && <Feedback {...feedback} />}
      </Panel>
    );
  }

  return (
    <Panel title="Entrar">
      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <Field
          autoComplete="username"
          label="E-mail"
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          value={email}
        />
        <Field
          autoComplete="current-password"
          label="Senha"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          value={password}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Button
          disabled={busy}
          onClick={() => void act("login", () => api.login(email, password))}
          tone="primary"
        >
          Entrar
        </Button>
        <Button
          disabled={busy}
          onClick={() => void act("register", () => api.register(email, password))}
        >
          Criar conta
        </Button>
        <Button disabled={busy} onClick={() => void act("csrf", api.csrf)}>
          Pegar token CSRF
        </Button>
      </div>

      {feedback && <Feedback {...feedback} />}

      <p style={{ color: "#8b93a7", fontSize: 12, margin: "14px 0 0" }}>
        Erro de login deve ser idêntico para e-mail inexistente e senha errada — inclusive no tempo
        de resposta. Compare os dois no painel de requisições abaixo.
      </p>
    </Panel>
  );
}

function Feedback({ kind, text }: { kind: "bad" | "good"; text: string }) {
  return (
    <p
      style={{
        color: kind === "good" ? "#16a34a" : "#dc2626",
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        margin: "12px 0 0",
      }}
    >
      {text}
    </p>
  );
}
