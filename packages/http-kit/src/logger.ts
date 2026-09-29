export type Logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
};

const LEVELS = { debug: 10, error: 40, info: 20, warn: 30 } as const;

/**
 * Log estruturado em 20 linhas, sem dependência.
 *
 * Correlacionar logs com request-id e trace-id é o assunto dos labs
 * `error-taxonomy` e `observability` — por isso não está aqui.
 */
export function logger(scope: string): Logger {
  const min = LEVELS[(process.env["LOG_LEVEL"] as keyof typeof LEVELS) ?? "info"] ?? LEVELS.info;
  const silent = process.env["NODE_ENV"] === "test" && !process.env["LOG_IN_TESTS"];

  const emit = (level: keyof typeof LEVELS) => (msg: string, meta?: Record<string, unknown>) => {
    if (silent || LEVELS[level] < min) return;
    const line = JSON.stringify({ level, msg, scope, time: new Date().toISOString(), ...meta });
    (level === "error" ? process.stderr : process.stdout).write(`${line}\n`);
  };

  return { debug: emit("debug"), error: emit("error"), info: emit("info"), warn: emit("warn") };
}
