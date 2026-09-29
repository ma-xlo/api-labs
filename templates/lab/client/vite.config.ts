import { labVite } from "@labs/vite-preset";
import { defineConfig } from "vite";

export default defineConfig(labVite({ port: __CLIENT_PORT__, serverPort: __SERVER_PORT__ }));
