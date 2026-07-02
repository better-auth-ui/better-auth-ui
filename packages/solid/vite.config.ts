import { rmSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig, type Plugin } from "vite"
import dts from "vite-plugin-dts"
import solid from "vite-plugin-solid"

/**
 * Deterministically clears `dist` before the build instead of relying on
 * Vite's built-in `emptyOutDir`, whose recursive removal can intermittently
 * fail with `ENOTEMPTY` when a stale nested directory (e.g.
 * `dist/components/auth/email`, produced by the email build pass) is left over
 * from a previous run. `rmSync` with `force` + `recursive` is race-free.
 */
function cleanOutDir(): Plugin {
  return {
    name: "better-auth-ui-solid:clean-out-dir",
    apply: "build",
    buildStart() {
      rmSync(resolve(__dirname, "dist"), { recursive: true, force: true })
    }
  }
}

export default defineConfig({
  plugins: [
    cleanOutDir(),
    solid(),
    dts({
      tsconfigPath: "./tsconfig.json",
      compilerOptions: { incremental: false, composite: false }
    })
  ],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "plugins/api-key/index": "src/plugins/api-key/index.ts",
        "plugins/captcha/index": "src/plugins/captcha/index.ts",
        "plugins/magic-link/index": "src/plugins/magic-link/index.ts",
        "plugins/multi-session/index": "src/plugins/multi-session/index.ts",
        "plugins/organization/index": "src/plugins/organization/index.ts",
        "plugins/passkey/index": "src/plugins/passkey/index.ts",
        "plugins/username/index": "src/plugins/username/index.ts"
      },
      formats: ["es"],
      fileName: "[name]"
    },
    rolldownOptions: {
      external: (id) =>
        !id.startsWith(".") && !id.startsWith("/") && !id.startsWith("\0"),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src"
      }
    },
    outDir: "dist",
    // `cleanOutDir` plugin handles clearing `dist` deterministically; Vite's
    // built-in recursive wipe can race and fail with `ENOTEMPTY` in CI.
    emptyOutDir: false
  }
})
