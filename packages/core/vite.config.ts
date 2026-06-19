import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [dts({ tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        plugins: "src/plugins.ts",
        server: "src/server.ts"
      },
      formats: ["es"]
    },
    rolldownOptions: {
      // Externalize all bare module IDs (not starting with `.` or `/` or `C:\`),
      // except `.json` data files which must be inlined: the published package
      // ships raw JSON that Node ESM only loads with an explicit
      // `with { type: "json" }` attribute, and the bundler strips that attribute
      // when externalizing. Inlining keeps the output browser-safe too.
      external: (id) => /^[^./](?!:[/\\])/.test(id) && !id.endsWith(".json")
    }
  }
})
