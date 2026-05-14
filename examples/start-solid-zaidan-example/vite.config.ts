import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/solid-start/plugin/vite"
import { defineConfig, loadEnv } from "vite"
import viteSolid from "vite-plugin-solid"

const exampleEnvDir = dirname(fileURLToPath(import.meta.url))
const serverAuthEnvKeys = [
  "BETTER_AUTH_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "BETTER_AUTH_SECRET"
] as const

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, exampleEnvDir, "")
  const serverAuthEnv = Object.fromEntries(
    serverAuthEnvKeys
      .filter((key) => process.env[key] === undefined && env[key] !== undefined)
      .map((key) => [key, env[key]])
  )

  Object.assign(process.env, serverAuthEnv)

  return {
    envDir: exampleEnvDir,
    plugins: [
      tailwindcss(),
      tanstackStart(),
      // TanStack Start requires Solid's Vite plugin after the Start plugin.
      viteSolid({ ssr: true })
    ],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname
      },
      dedupe: ["solid-js", "solid-js/store", "solid-js/web"]
    },
    ssr: {
      noExternal: ["@better-auth-ui/solid"]
    }
  }
})
