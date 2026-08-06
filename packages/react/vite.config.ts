import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        email: "src/email.ts",
        "plugins/admin/index": "src/plugins/admin/index.ts",
        "plugins/anonymous/index": "src/plugins/anonymous/index.ts",
        "plugins/api-key/index": "src/plugins/api-key/index.ts",
        "plugins/captcha/index": "src/plugins/captcha/index.ts",
        "plugins/device-authorization/index":
          "src/plugins/device-authorization/index.ts",
        "plugins/email-otp/index": "src/plugins/email-otp/index.ts",
        "plugins/magic-link/index": "src/plugins/magic-link/index.ts",
        "plugins/multi-session/index": "src/plugins/multi-session/index.ts",
        "plugins/oauth-provider/index": "src/plugins/oauth-provider/index.ts",
        "plugins/one-tap/index": "src/plugins/one-tap/index.ts",
        "plugins/organization/index": "src/plugins/organization/index.ts",
        "plugins/passkey/index": "src/plugins/passkey/index.ts",
        "plugins/phone-number/index": "src/plugins/phone-number/index.ts",
        "plugins/two-factor/index": "src/plugins/two-factor/index.ts",
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
