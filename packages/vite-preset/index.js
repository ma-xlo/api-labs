import react from "@vitejs/plugin-react";

/**
 * Config padrão de um cliente de lab. Faz cada vite.config.ts caber em 3 linhas.
 *
 * O proxy de /api é a decisão central: o browser vê same-origin, então o cookie
 * se comporta como em produção sem brigar com `SameSite=None; Secure` em http.
 * Passe `proxy: false` no lab que existe justamente para exercitar cross-origin.
 *
 * @param {{ port: number; serverPort: number; proxy?: boolean }} opts
 */
export function labVite({ port, proxy = true, serverPort }) {
  return {
    plugins: [react()],
    server: {
      port,
      // Falhe em vez de pular para a próxima porta: colisão silenciosa
      // significa um lab batendo na API de outro.
      strictPort: true,
      ...(proxy
        ? { proxy: { "/api": { changeOrigin: false, target: `http://localhost:${serverPort}` } } }
        : {}),
    },
  };
}
