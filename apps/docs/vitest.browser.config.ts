import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tailwindcss(), react()],
  optimizeDeps: {
    include: [
      "@testing-library/react",
      "fumadocs-core/search/client",
      "fumadocs-ui/components/dialog/search",
      "fumadocs-ui/contexts/i18n"
    ]
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src")
    }
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
      screenshotDirectory: ".vitest-attachments/screenshots"
    },
    include: ["tests/browser/**/*.browser.tsx"]
  }
})
