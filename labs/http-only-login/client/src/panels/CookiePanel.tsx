import { CookieInspector, Panel } from "@labs/ui-kit";

/**
 * O argumento visual do lab.
 *
 * Enquanto a sessão funciona perfeitamente, o cookie `sid` NÃO aparece aqui.
 * Ler "HttpOnly impede acesso por JavaScript" e ver o campo vazio com a sessão
 * ativa ao lado são duas coisas diferentes.
 */
export function CookiePanel() {
  return (
    <Panel title="O que o JavaScript enxerga">
      <CookieInspector />

      <div style={{ borderTop: "1px solid #2a2f3a", fontSize: 12, marginTop: 14, paddingTop: 12 }}>
        <p style={{ color: "#8b93a7", margin: "0 0 10px" }}>
          Com a sessão ativa, <code>sid</code> não deve aparecer acima. Só <code>csrf</code> — que é
          o único cookie deste lab sem <code>HttpOnly</code>, porque o JavaScript precisa lê-lo para
          espelhar no header.
        </p>

        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {[
              ["HttpOnly", "o JS não lê. Um XSS deixa de ser roubo de sessão."],
              ["Secure", "só viaja em HTTPS — e localhost conta como origem confiável."],
              ["SameSite=Lax", "não acompanha requisição cross-site que muda estado."],
              ["sem Max-Age", "o prazo que vale está no servidor; Max-Age não revoga nada."],
            ].map(([flag, why]) => (
              <tr key={flag} style={{ verticalAlign: "top" }}>
                <td
                  style={{
                    color: "#2563eb",
                    fontFamily: "ui-monospace, monospace",
                    padding: "3px 10px 3px 0",
                    whiteSpace: "nowrap",
                  }}
                >
                  {flag}
                </td>
                <td style={{ color: "#8b93a7", padding: "3px 0" }}>{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
