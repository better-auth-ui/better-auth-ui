import type { Decorator, Preview } from "@storybook/react-vite"
import "../src/styles/app.css"

function applyModeToDOM(mode: "light" | "dark") {
  const root = document.documentElement

  root.classList.toggle("dark", mode === "dark")
  root.setAttribute("data-theme", mode)
}

const withTheme: Decorator = (Story, context) => {
  applyModeToDOM(context.globals.mode === "dark" ? "dark" : "light")
  return <Story />
}

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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
}

export default preview
