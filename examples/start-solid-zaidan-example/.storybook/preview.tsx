import type { Preview } from "storybook-solidjs-vite"
import { IS_SOLID_JSX_FLAG } from "storybook-solidjs-vite"
import "../src/styles/globals.css"

function applyModeToDOM(mode: "light" | "dark") {
  const root = document.documentElement

  if (mode === "dark") {
    root.classList.add("dark")
    root.setAttribute("data-theme", "dark")
    return
  }

  root.classList.remove("dark")
  root.setAttribute("data-theme", "light")
}

const withTheme = (
  Story: () => unknown,
  context: { globals: { mode?: string } }
) => {
  const mode = context.globals.mode === "dark" ? "dark" : "light"
  applyModeToDOM(mode)

  return Story()
}

withTheme[IS_SOLID_JSX_FLAG] = true

const preview: Preview = {
  globalTypes: {
    mode: {
      description: "Color mode",
      toolbar: {
        title: "Mode",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    mode: "light"
  },
  decorators: [withTheme],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
}

export default preview
