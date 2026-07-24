import {
  ThemePreviewDark,
  ThemePreviewLight,
  ThemePreviewSystem,
  useAuthPlugin
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

import { themePlugin } from "../../../lib/auth/theme-plugin"

export type AppearanceProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders a theme selector card with visual theme previews.
 *
 * Displays a card containing radio buttons for selecting between system, light,
 * and dark themes. Each option shows a visual preview of the theme. Theme options
 * are conditionally shown based on the `themes` array provided via the theme plugin.
 */
export function Appearance({
  className,
  variant,
  ...props
}: AppearanceProps & Omit<CardProps, "children">) {
  const { useTheme, localization } = useAuthPlugin(themePlugin)
  const { theme, setTheme, themes = [] } = useTheme()
  const hydrated = useIsHydrated()

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.appearance}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <Label>{localization.theme}</Label>

          <RadioGroup
            variant={variant === "transparent" ? "secondary" : "primary"}
            value={hydrated ? theme : ""}
            onChange={setTheme}
            isDisabled={!hydrated || !theme}
          >
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {themes.includes("system") && (
                <Radio
                  value="system"
                  className={cn(
                    "mt-0 px-4 pb-4 pt-3 rounded-xl",
                    "border border-transparent data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                    "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10",
                    variant === "transparent"
                      ? "bg-surface"
                      : "bg-surface-secondary"
                  )}
                >
                  <Radio.Content className="gap-2">
                    <div className="flex gap-2 justify-between">
                      <span className="flex gap-2 items-center">
                        <Display className="text-muted" />
                        {localization.system}
                      </span>

                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                    </div>

                    <ThemePreviewSystem className="w-full" />
                  </Radio.Content>
                </Radio>
              )}

              {themes.includes("light") && (
                <Radio
                  value="light"
                  className={cn(
                    "mt-0 px-4 pb-4 pt-3 rounded-xl",
                    "border border-transparent data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                    "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10",
                    variant === "transparent"
                      ? "bg-surface"
                      : "bg-surface-secondary"
                  )}
                >
                  <Radio.Content className="gap-2">
                    <div className="flex gap-2 justify-between">
                      <span className="flex gap-2 items-center">
                        <Sun className="text-muted" />
                        {localization.light}
                      </span>

                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                    </div>

                    <ThemePreviewLight className="w-full" />
                  </Radio.Content>
                </Radio>
              )}

              {themes.includes("dark") && (
                <Radio
                  value="dark"
                  className={cn(
                    "mt-0 px-4 pb-4 pt-3 rounded-xl",
                    "border border-transparent data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                    "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10",
                    variant === "transparent"
                      ? "bg-surface"
                      : "bg-surface-secondary"
                  )}
                >
                  <Radio.Content className="gap-2">
                    <div className="flex gap-2 justify-between">
                      <span className="flex gap-2 items-center">
                        <Moon className="text-muted" />
                        {localization.dark}
                      </span>

                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                    </div>

                    <ThemePreviewDark className="w-full" />
                  </Radio.Content>
                </Radio>
              )}
            </div>
          </RadioGroup>
        </Card.Content>
      </Card>
    </div>
  )
}
