import { defineConfig } from "cf/config"
export default defineConfig({
  worker: {
    name: "start-shadcn-aria-example",
    compatibilityDate: "2025-09-02",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint: "@tanstack/react-start/server-entry",
    observability: {
      issues: {
        enabled: true
      },
      logs: {
        enabled: true,
        invocationLogs: true
      }
    }
  }
})
