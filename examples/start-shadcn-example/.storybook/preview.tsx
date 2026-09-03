import type { Decorator, Preview } from "@storybook/react-vite"
import "../src/styles/app.css"
import { applyStoryTheme } from "../src/stories/support/story-theme"

const withTheme: Decorator = (Story, context) => {
  applyStoryTheme(context.globals.mode === "dark" ? "dark" : "light")
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
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    options: {
      storySort: {
        order: [
          "shadcn",
          [
            "Components",
            [
              "Authentication",
              "Reauthentication",
              "User",
              "Account settings",
              "Component states"
            ],
            "Plugins",
            [
              "Core plugins",
              "Advanced authentication",
              "Authentication helpers",
              "Organization",
              "Integrations"
            ]
          ]
        ]
      }
    }
  }
}

export default preview
