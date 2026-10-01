import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
      "@better-auth-ui/core": resolve(
        import.meta.dirname,
        "../../packages/core/src"
      ),
      "@better-auth-ui/react": resolve(
        import.meta.dirname,
        "../../packages/react/src"
      )
    }
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["tests/source-sync.test.ts"],
          name: "source-sync"
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
