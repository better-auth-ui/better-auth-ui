import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { storyRenders } from "./story-coverage"

function StorybookInfra(props: { description?: string }) {
  return (
    <main class="min-h-48 rounded-lg border bg-background p-6 text-foreground">
      <div class="flex flex-col gap-2">
        <p class="font-medium text-sm">Zaidan Storybook infrastructure</p>
        <p class="text-muted-foreground text-sm">
          {props.description ??
            "This story keeps the Solid/Zaidan Storybook build ready for component demos."}
        </p>
      </div>
    </main>
  )
}

const meta = {
  title: "Zaidan/Infrastructure/Storybook",
  component: StorybookInfra,
  args: {
    description:
      "This story keeps the Solid/Zaidan Storybook build ready for component demos."
  },
  argTypes: { description: { control: "text" } }
} satisfies Meta<typeof StorybookInfra>

export default meta

type Story = StoryObj<typeof meta>

export const Placeholder: Story = { play: storyRenders }
