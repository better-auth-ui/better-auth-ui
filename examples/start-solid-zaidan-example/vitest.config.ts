import { resolve } from "node:path"
import { playwright } from "@vitest/browser-playwright"
import solid from "vite-plugin-solid"
import { defineConfig } from "vitest/config"

export default defineConfig({
  optimizeDeps: {
    include: ["@tanstack/solid-store"]
  },
  plugins: [solid({ ssr: true })],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
      "@better-auth-ui/core": resolve(
        import.meta.dirname,
        "../../packages/core/src"
      ),
      "@better-auth-ui/solid": resolve(
        import.meta.dirname,
        "../../packages/solid/src"
      )
    },
    dedupe: ["solid-js", "solid-js/store", "solid-js/web"]
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          exclude: ["tests/**/*.browser.test.{ts,tsx}"],
          include: ["tests/**/*.test.{ts,tsx}"],
          name: "unit"
        }
      },
      {
        extends: true,
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
            screenshotDirectory: ".vitest-attachments/screenshots"
          },
          include: ["tests/**/*.browser.test.{ts,tsx}"],
          name: "browser"
        }
      }
    ]
  }
})
