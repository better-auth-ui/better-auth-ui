import type { Preview } from "storybook-solidjs-vite"
import { IS_SOLID_JSX_FLAG } from "storybook-solidjs-vite"
import "../src/styles/globals.css"
import { applyStoryTheme } from "../src/stories/story-theme"

const withTheme = (
  Story: () => unknown,
  context: { globals: { mode?: string } }
) => {
  const mode = context.globals.mode === "dark" ? "dark" : "light"
  applyStoryTheme(mode)

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
