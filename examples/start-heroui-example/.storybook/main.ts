import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"
import { mergeConfig, type PluginOption, type UserConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  core: {
    disableTelemetry: true
  },
  async viteFinal(config: UserConfig) {
    return mergeConfig(
      {
        ...config,
        plugins: removeApplicationPlugins(config.plugins)
      },
      {
        base: process.env.STORYBOOK_BASE_PATH || "/",
        plugins: [tailwindcss()],
        resolve: {
          alias: {
            "@": resolve(__dirname, "../src"),
            "@better-auth-ui/heroui": resolve(
              __dirname,
              "../../../packages/heroui/src"
            ),
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
          noExternal: ["@better-auth-ui/heroui", "@better-auth-ui/react"]
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

    const name = String((plugin as { name?: string }).name)
    if (!/(cloudflare|tanstack|devtools|tailwindcss)/i.test(name)) {
      filtered.push(plugin)
    }
  }

  return filtered
}

export default config
