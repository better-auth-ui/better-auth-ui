import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/**/*.test.{ts,tsx}"],
          exclude: ["tests/**/*.browser.test.tsx"]
        }
      },
      {
        plugins: [react()],
        optimizeDeps: {
          include: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "@testing-library/react",
            "@testing-library/user-event",
            "@tanstack/react-query",
            "@tanstack/react-form"
          ],
          exclude: [
            "expo-clipboard",
            "expo-image-picker",
            "expo-image-manipulator"
          ]
        },
        resolve: {
          extensions: [
            ".web.tsx",
            ".web.ts",
            ".web.js",
            ".tsx",
            ".ts",
            ".js",
            ".json"
          ],
          dedupe: ["react", "react-dom"],
          alias: [
            { find: /^react-native$/, replacement: "react-native-web" },
            {
              find: /^react-native-svg$/,
              replacement: resolve(
                import.meta.dirname,
                "../../node_modules/react-native-svg/lib/module/elements.web.js"
              )
            },
            {
              find: "@better-auth-ui/core",
              replacement: resolve(import.meta.dirname, "../core/src")
            },
            {
              find: "@better-auth-ui/react",
              replacement: resolve(import.meta.dirname, "../react/src")
            }
          ]
        },
        test: {
          name: "browser",
          include: ["tests/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            screenshotDirectory: ".vitest-attachments/screenshots"
          }
        }
      }
    ]
  }
})
