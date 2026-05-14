import { resolve } from "node:path"
import solid from "vite-plugin-solid"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@better-auth-ui/core": resolve(__dirname, "../core/src")
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"]
  }
})
