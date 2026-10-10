import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { createDtsPluginOptions } from "../../tools/vite/dts-node-import-extensions.ts"

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
  plugins: [
    react(),
    dts(createDtsPluginOptions({ tsconfigPath: "./tsconfig.json" }))
  ],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        plugins: "src/plugins.ts",
        "plugins/admin": "src/plugins/admin/index.ts",
        "plugins/agent-auth": "src/plugins/agent-auth/index.ts",
        "plugins/anonymous": "src/plugins/anonymous/index.ts",
        "plugins/api-key": "src/plugins/api-key/index.ts",
        "plugins/billing": "src/plugins/billing/index.ts",
        "plugins/dash": "src/plugins/dash/index.ts",
        "plugins/delete-user": "src/plugins/delete-user/index.ts",
        "plugins/device-authorization":
          "src/plugins/device-authorization/index.ts",
        "plugins/email-otp": "src/plugins/email-otp/index.ts",
        "plugins/last-login-method": "src/plugins/last-login-method/index.ts",
        "plugins/magic-link": "src/plugins/magic-link/index.ts",
        "plugins/multi-session": "src/plugins/multi-session/index.ts",
        "plugins/oauth-provider": "src/plugins/oauth-provider/index.ts",
        "plugins/organization": "src/plugins/organization/index.ts",
        "plugins/passkey": "src/plugins/passkey/index.ts",
        "plugins/phone-number": "src/plugins/phone-number/index.ts",
        "plugins/siwe": "src/plugins/siwe/index.ts",
        "plugins/sso": "src/plugins/sso/index.ts",
        "plugins/theme": "src/plugins/theme/index.ts",
        "plugins/two-factor": "src/plugins/two-factor/index.ts",
        "plugins/username": "src/plugins/username/index.ts"
      },
      formats: ["es"]
    },
    rolldownOptions: {
      // All bare module IDs (not starting with `.` or `/` or `C:\`)
      external: /^[^./](?!:[/\\])/
    }
  }
})
