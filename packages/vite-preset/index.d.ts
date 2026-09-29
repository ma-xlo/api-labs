import type { UserConfig } from "vite";

export declare function labVite(opts: {
  port: number;
  proxy?: boolean;
  serverPort: number;
}): UserConfig;
