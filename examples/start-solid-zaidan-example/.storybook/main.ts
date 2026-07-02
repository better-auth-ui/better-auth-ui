import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import type { StorybookConfig } from "storybook-solidjs-vite"
import {
  mergeConfig,
  type Plugin,
  type PluginOption,
  type UserConfig
} from "vite"

/**
 * `vite-plugin-solid` prepends the `solid` resolve condition, which makes every
 * Solid dependency (@tanstack/solid-router, @kobalte/core, solid-sonner, ...)
 * resolve to its uncompiled JSX *source*. Storybook's production build then runs
 * the Babel Solid transform over all of it on every cold build, which is the
 * dominant cost.
 *
 * For this client-only Storybook build we don't need to recompile dependencies
 * from source, so strip the `solid`/`development` conditions and let those
 * packages resolve to their prebuilt ESM. Local stories and components are still
 * compiled by `vite-plugin-solid` (that is driven by file extension, not the
 * resolve condition).
 */
function preferPrebuiltSolidDeps(): Plugin {
  return {
    name: "prefer-prebuilt-solid-deps",
    enforce: "post",
    configResolved(resolved) {
      const conditions = resolved.resolve?.conditions
      if (!conditions) return
      const filtered = conditions.filter(
        (condition) => condition !== "solid" && condition !== "development"
      )
      conditions.length = 0
      conditions.push(...filtered)
    }
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "storybook-solidjs-vite",
    options: {}
  },
  core: {
    disableTelemetry: true
  },
  async viteFinal(config: UserConfig) {
    const plugins = removeTanStackStartPlugins(config.plugins)

    return mergeConfig(
      {
        ...config,
        plugins
      },
      {
        base: process.env.STORYBOOK_BASE_PATH || "/",
        plugins: [preferPrebuiltSolidDeps(), tailwindcss()],
        resolve: {
          alias: {
            "@": resolve(__dirname, "../src"),
            "@better-auth-ui/solid": resolve(
              __dirname,
              "../../../packages/solid/src"
            )
          },
          conditions: ["browser", "default"],
          dedupe: ["solid-js", "solid-js/store", "solid-js/web"]
        },
        build: {
          target: "esnext",
          sourcemap: false
        },
        ssr: {
          noExternal: ["@better-auth-ui/solid"]
        }
      }
    )
  }
}

function removeTanStackStartPlugins(plugins: PluginOption | undefined) {
  if (!Array.isArray(plugins)) return plugins

  const filtered: PluginOption[] = []

  for (const plugin of plugins) {
    if (!plugin || typeof plugin === "boolean") continue

    if (Array.isArray(plugin)) {
      const nested = removeTanStackStartPlugins(plugin)
      if (Array.isArray(nested)) filtered.push(...nested)
      continue
    }

    const name = String((plugin as { name?: string }).name)
    if (!name.includes("tanstack")) filtered.push(plugin)
  }

  return filtered
}

export default config
