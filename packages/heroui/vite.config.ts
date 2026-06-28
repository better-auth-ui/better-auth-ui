import { copyFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import dts from "vite-plugin-dts"

/**
 * Copies `src/styles.css` to `dist/styles.css` after each build so the
 * `@better-auth-ui/heroui/styles` package export survives `emptyOutDir` wipes.
 */
function copyStyles(): Plugin {
  return {
    name: "better-auth-ui-heroui:copy-styles",
    apply: "build",
    closeBundle() {
      copyFileSync(
        resolve(__dirname, "src/styles.css"),
        resolve(__dirname, "dist/styles.css")
      )
    }
  }
}

export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.json" }), copyStyles()],
  build: {
    lib: {
      entry: {
        index: "src/index.tsx",
        email: "src/email.ts",
        plugins: "src/plugins.ts",
        "plugins/api-key/index": "src/plugins/api-key/index.ts",
        "plugins/delete-user/index": "src/plugins/delete-user/index.ts",
        "plugins/magic-link/index": "src/plugins/magic-link/index.ts",
        "plugins/multi-session/index": "src/plugins/multi-session/index.ts",
        "plugins/organization/index": "src/plugins/organization/index.ts",
        "plugins/passkey/index": "src/plugins/passkey/index.ts",
        "plugins/theme/index": "src/plugins/theme/index.ts",
        "plugins/username/index": "src/plugins/username/index.ts"
      },
      formats: ["es"]
    },
    rolldownOptions: {
      // All bare module IDs (not starting with `.` or `/` or `C:\`)
      external: /^[^./](?!:[/\\])/
    }
  }
})
