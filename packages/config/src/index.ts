import { config as loadDotenv } from "dotenv";
import { z } from "zod";

/**
 * Carrega e valida o env na subida do processo. Falha ANTES de aceitar tráfego.
 *
 * Um servidor que sobe com config inválida e só quebra na primeira requisição
 * é pior que um que não sobe: o healthcheck passa e o deploy é promovido.
 */
export function defineEnv<T extends z.ZodRawShape>(shape: T): z.infer<z.ZodObject<T>> {
  loadDotenv({ path: [".env.local", ".env"], quiet: true });

  const parsed = z.object(shape).safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(raiz)"}: ${i.message}`)
      .join("\n");
    console.error(`\nConfiguração inválida. O processo não vai subir.\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

/** Helper para schemas: "3000" -> 3000, com validação de faixa. */
export const port = () => z.coerce.number().int().min(1).max(65535);

/** Helper para schemas: "true"/"1" -> true. */
export const bool = (fallback: boolean) =>
  z
    .enum(["true", "false", "1", "0"])
    .default(fallback ? "true" : "false")
    .transform((v) => v === "true" || v === "1");

export const isTest = process.env["NODE_ENV"] === "test";
export const isProduction = process.env["NODE_ENV"] === "production";

export { z };
