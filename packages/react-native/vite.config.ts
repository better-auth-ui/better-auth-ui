import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

/**
 * Library build for `@better-auth-ui/react-native`.
 *
 * Mirrors the other UI packages: a single ES entry with every bare module ID
 * left external (react, react-native, react-native-svg, the
 * `@better-auth-ui/*` logic packages, better-auth, tanstack-query, …). React
 * Native consumers resolve the `src` export condition and let Metro compile
 * the source directly, so this build primarily produces the published `dist`
 * and the `.d.ts` types used for typechecking.
 */
export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        plugins: "src/plugins.ts"
      },
      formats: ["es"]
    },
    rolldownOptions: {
      // All bare module IDs (not starting with `.` or `/` or `C:\`)
      external: /^[^./](?!:[/\\])/
    }
  }
})
