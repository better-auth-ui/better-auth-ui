import { resolve } from "node:path"
import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"
import { mergeConfig, type PluginOption, type UserConfig } from "vite"

const __dirname = import.meta.dirname

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  core: {
    disableTelemetry: true
  },
  viteFinal(pluginConfig: UserConfig) {
    return mergeConfig(
      {
        ...pluginConfig,
        plugins: removeApplicationPlugins(pluginConfig.plugins)
      },
      {
        base: process.env["STORYBOOK_BASE_PATH"] || "/",
        plugins: [tailwindcss()],
        resolve: {
          alias: {
            "@": resolve(__dirname, "../src"),
            "@better-auth-ui/react": resolve(
              __dirname,
              "../../../packages/react/src"
            )
          },
          dedupe: ["react", "react-dom", "@tanstack/react-query"]
        },
        build: {
          sourcemap: false,
          target: "esnext"
        },
        ssr: {
          noExternal: ["@better-auth-ui/react"]
        }
      }
    )
  }
}

function removeApplicationPlugins(plugins: PluginOption | undefined) {
  if (!Array.isArray(plugins)) return plugins

  const filtered: PluginOption[] = []

  for (const plugin of plugins) {
    if (!plugin || typeof plugin === "boolean") continue

    if (Array.isArray(plugin)) {
      const nested = removeApplicationPlugins(plugin)
      if (Array.isArray(nested)) filtered.push(...nested)
      continue
    }

    const name = String(
      typeof plugin === "object" && "name" in plugin ? plugin.name : undefined
    )
    if (!/(cloudflare|tanstack|devtools|tailwindcss)/iu.test(name)) {
      filtered.push(plugin)
    }
  }

  return filtered
}

export default config
