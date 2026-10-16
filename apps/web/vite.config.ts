import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

/**
 * Development only. In production the build output is served by Fastify from
 * one Node process (see apps/api/src/main.ts), so there is no Vite server and
 * no second port.
 */
export default defineConfig({
  plugins: [reactRouter()],
  server: {
    port: 5173,
    // The dev container sets VITE_DEV_HOST=0.0.0.0 so the nginx of the
    // orchestrator repo can reach the dev server; locally it stays on loopback.
    host: process.env["VITE_DEV_HOST"] ?? "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: false,
      },
    },
  },
});
