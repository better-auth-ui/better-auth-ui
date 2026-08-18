import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [dts({ tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "plugins/admin/index": "src/plugins/admin/index.ts",
        "plugins/anonymous/index": "src/plugins/anonymous/index.ts",
        "plugins/api-key/index": "src/plugins/api-key/index.ts",
        "plugins/billing/index": "src/plugins/billing/index.ts",
        "plugins/api-key/server": "src/plugins/api-key/server.ts",
        "plugins/delete-user/index": "src/plugins/delete-user/index.ts",
        "plugins/device-authorization/index":
          "src/plugins/device-authorization/index.ts",
        "plugins/email-otp/index": "src/plugins/email-otp/index.ts",
        "plugins/last-login-method/index":
          "src/plugins/last-login-method/index.ts",
        "plugins/magic-link/index": "src/plugins/magic-link/index.ts",
        "plugins/magic-link/server": "src/plugins/magic-link/server.ts",
        "plugins/multi-session/index": "src/plugins/multi-session/index.ts",
        "plugins/multi-session/server": "src/plugins/multi-session/server.ts",
        "plugins/oauth-provider/index": "src/plugins/oauth-provider/index.ts",
        "plugins/one-tap/index": "src/plugins/one-tap/index.ts",
        "plugins/organization/index": "src/plugins/organization/index.ts",
        "plugins/organization/server": "src/plugins/organization/server.ts",
        "plugins/passkey/index": "src/plugins/passkey/index.ts",
        "plugins/passkey/server": "src/plugins/passkey/server.ts",
        "plugins/phone-number/index": "src/plugins/phone-number/index.ts",
        "plugins/sso/index": "src/plugins/sso/index.ts",
        "plugins/siwe/index": "src/plugins/siwe/index.ts",
        "plugins/theme/index": "src/plugins/theme/index.ts",
        "plugins/two-factor/index": "src/plugins/two-factor/index.ts",
        "plugins/username/index": "src/plugins/username/index.ts",
        "plugins/username/server": "src/plugins/username/server.ts",
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
