import {
  ThemePreviewDark,
  ThemePreviewLight,
  ThemePreviewSystem,
  useAuth
} from "@better-auth-ui/react"
import { Display, Moon, Sun } from "@gravity-ui/icons"
import {
  Card,
  type CardProps,
  cn,
  Label,
  Radio,
  RadioGroup,
  useIsHydrated
} from "@heroui/react"

export type AppearanceProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders a theme selector card with visual theme previews.
 *
 * Displays a card containing radio buttons for selecting between system, light,
 * and dark themes. Each option shows a visual preview of the theme. Only renders
 * if theme settings are configured (theme, setTheme, and themes are provided).
 *
 * @param className - Optional additional CSS class names for the card container.
 * @returns A JSX element containing the theme selector card, or null if theme settings are not configured.
 */
export function Appearance({
  className,
  variant,
  ...props
}: AppearanceProps & CardProps) {
  const {
    localization,
    settings: { theme, setTheme, themes }
  } = useAuth()

  const hydrated = useIsHydrated()

  if (!setTheme || !themes?.length) {
    return null
  }

  return (
    <Card
      className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.appearance}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <RadioGroup
          variant={variant === "transparent" ? "primary" : "secondary"}
          value={hydrated ? theme : undefined}
          onChange={setTheme}
          isDisabled={!hydrated || !theme}
        >
          <Label className="mb-2">{localization.settings.theme}</Label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.includes("system") && (
              <Radio
                value="system"
                className={cn(
                  "mt-0 group relative flex-col gap-4 rounded-xl border px-5 py-4 hover:bg-default/20 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                  "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10"
                )}
              >
                <Radio.Control className="absolute top-3 right-3 size-5">
                  <Radio.Indicator />
                </Radio.Control>

                <Radio.Content className="flex flex-col gap-3">
                  <Label className="cursor-pointer font-medium flex gap-2 items-center">
                    <Display className="text-muted" />
                    {localization.settings.system}
                  </Label>

                  <ThemePreviewSystem className="w-full" />
                </Radio.Content>
              </Radio>
            )}

            {themes.includes("light") && (
              <Radio
                value="light"
                className={cn(
                  "mt-0 group relative flex-col gap-4 rounded-xl border px-5 py-4 hover:bg-default/20 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                  "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10"
                )}
              >
                <Radio.Control className="absolute top-3 right-3 size-5">
                  <Radio.Indicator />
                </Radio.Control>

                <Radio.Content className="flex flex-col gap-3">
                  <Label className="cursor-pointer font-medium flex gap-2 items-center">
                    <Sun className="text-muted" />
                    {localization.settings.light}
                  </Label>

                  <ThemePreviewLight className="w-full" />
                </Radio.Content>
              </Radio>
            )}

            {themes.includes("dark") && (
              <Radio
                value="dark"
                className={cn(
                  "mt-0 group relative flex-col gap-4 rounded-xl border px-5 py-4 hover:bg-default/20 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                  "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10"
                )}
              >
                <Radio.Control className="absolute top-3 right-3 size-5">
                  <Radio.Indicator />
                </Radio.Control>

                <Radio.Content className="flex flex-col gap-3">
                  <Label className="cursor-pointer font-medium flex gap-2 items-center">
                    <Moon className="text-muted" />
                    {localization.settings.dark}
                  </Label>

                  <ThemePreviewDark className="w-full" />
                </Radio.Content>
              </Radio>
            )}
          </div>
        </RadioGroup>
      </Card.Content>
    </Card>
  )
}
