import type { Meta, StoryObj } from "storybook-solidjs-vite"

function StorybookInfra() {
  return (
    <main class="min-h-48 rounded-lg border bg-background p-6 text-foreground">
      <div class="space-y-2">
        <p class="font-medium text-sm">Zaidan Storybook infrastructure</p>
        <p class="text-muted-foreground text-sm">
          This placeholder story keeps the Solid/Zaidan Storybook build ready
          for future copied component demos.
        </p>
      </div>
    </main>
  )
}

const meta = {
  title: "Zaidan/Infrastructure/Storybook",
  component: StorybookInfra
} satisfies Meta<typeof StorybookInfra>

export default meta

type Story = StoryObj<typeof meta>

export const Placeholder: Story = {}
