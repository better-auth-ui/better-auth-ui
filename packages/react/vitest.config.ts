import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@better-auth-ui/core": resolve(__dirname, "../core/src")
    }
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      headless: true,
      // Keep failure screenshots out of `__screenshots__/`, which is reserved
      // for tracked `toMatchScreenshot()` reference images.
      screenshotDirectory: ".vitest-attachments/screenshots",
      provider: playwright(),
      instances: [{ browser: "chromium" }]
    },
    include: ["tests/**/*.test.{ts,tsx}"]
  }
})
