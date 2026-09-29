import { Panel } from "@labs/ui-kit";

const EVIL = "http://127.0.0.1:4002/attacker.html";

/**
 * A terceira origem existe por um motivo técnico preciso.
 *
 * Para cookies, "site" é o domínio registrável e IGNORA a porta. Então
 * localhost:4001 → localhost:4000 é cross-ORIGIN mas same-SITE: SameSite=Lax
 * continua mandando o cookie, e um teste de CSRF montado só entre essas duas
 * portas passa sem ter exercitado nada.
 *
 * 127.0.0.1 não tem domínio registrável em comum com localhost — é outro site
 * de verdade. É de lá que o ataque tem que partir para significar alguma coisa.
 */
export function AttackPanel() {
  return (
    <Panel
      right={<span style={{ color: "#d97706", fontSize: 12 }}>cross-site</span>}
      title="O site atacante"
    >
      <p style={{ color: "#8b93a7", fontSize: 12, margin: "0 0 12px" }}>
        <code style={{ color: "#dc2626" }}>127.0.0.1:4002</code> é um <strong>site</strong>{" "}
        diferente de <code>localhost:4001</code> — e isso importa: para cookies, site é o domínio
        registrável e ignora a porta. Entre as duas portas de <code>localhost</code> o
        <code> SameSite=Lax</code> nunca seria exercitado.
      </p>

      <a
        href={EVIL}
        rel="noreferrer"
        style={{
          background: "#161a22",
          border: "1px solid #dc2626",
          borderRadius: 6,
          color: "#e6e9ef",
          display: "inline-block",
          fontSize: 13,
          padding: "6px 12px",
          textDecoration: "none",
        }}
        target="_blank"
      >
        Abrir o site atacante ↗
      </a>

      <ol
        style={{
          color: "#8b93a7",
          fontSize: 12,
          lineHeight: 1.7,
          margin: "14px 0 0",
          paddingLeft: 18,
        }}
      >
        <li>Faça login aqui primeiro.</li>
        <li>
          Abra o site atacante e dispare o ataque — com as defesas ligadas, deve falhar com 403.
        </li>
        <li>
          Suba o servidor com <code>CSRF_MODE=off CHECK_ORIGIN=false</code> e repita: agora passa.
        </li>
      </ol>

      <p style={{ color: "#8b93a7", fontSize: 12, margin: "12px 0 0" }}>
        O passo 3 é o que vale. Um teste que só confirma que o ataque falha não distingue “a defesa
        funcionou” de “o ataque estava mal escrito”.
      </p>
    </Panel>
  );
}
