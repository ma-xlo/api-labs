import { labVite } from "@labs/vite-preset";
import { defineConfig } from "vite";

// O proxy de /api faz o navegador ver same-origin, então o cookie se comporta
// como em produção sem brigar com `SameSite=None; Secure` em http://localhost.
// VITE_DIRECT_API=1 desliga o proxy e força cross-origin — de propósito.
export default defineConfig(
  labVite({ port: 4001, proxy: process.env["VITE_DIRECT_API"] !== "1", serverPort: 4000 }),
);
