import { useAuthPlugin } from "@better-auth-ui/react"
import { themePlugin } from "../../../lib/auth/theme-plugin"
import { cn } from "../../../lib/cn"
import { Card, type CardVariant } from "../../../primitives/card"
import { Label } from "../../../primitives/field"
import { Box, Txt } from "../../../primitives/styled"
import { Radio, RadioGroup } from "../../../primitives/switch-radio"
import { Display, Moon, Sun } from "../../../primitives/ui-icons"

export type AppearanceProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Renders a theme selector card with a light/dark/system picker. Mirrors the
 * heroui `Appearance`, adapted for React Native: the radio options render as
 * a `RadioGroup`/`Radio` list (no visual theme-preview SVGs, no CSS `data-*`
 * selected/focus-visible styling), and `useIsHydrated` is dropped entirely —
 * RN has no SSR/hydration concept, so the theme value is always available
 * immediately.
 */
export function Appearance({ className, variant }: AppearanceProps) {
  const { useTheme, localization } = useAuthPlugin(themePlugin)
  const { theme, setTheme, themes = [] } = useTheme()

  return (
    <Box className={cn("gap-3", className)}>
      <Txt className="mb-1 text-sm font-semibold text-foreground">
        {localization.appearance}
      </Txt>

      <Card className="gap-4 p-4" variant={variant}>
        <Card.Content className="gap-3">
          <Label>{localization.theme}</Label>

          <RadioGroup
            value={theme}
            onChange={setTheme}
            isDisabled={!theme}
            className="gap-2"
          >
            {themes.includes("system") && (
              <Radio
                value="system"
                className={cn(
                  "rounded-xl border border-transparent px-4 py-3",
                  variant === "transparent"
                    ? "bg-surface"
                    : "bg-surface-secondary"
                )}
              >
                <Box className="flex-1 flex-row items-center gap-2">
                  <Display className="text-muted" />
                  <Txt className="text-sm text-foreground">
                    {localization.system}
                  </Txt>
                </Box>
              </Radio>
            )}

            {themes.includes("light") && (
              <Radio
                value="light"
                className={cn(
                  "rounded-xl border border-transparent px-4 py-3",
                  variant === "transparent"
                    ? "bg-surface"
                    : "bg-surface-secondary"
                )}
              >
                <Box className="flex-1 flex-row items-center gap-2">
                  <Sun className="text-muted" />
                  <Txt className="text-sm text-foreground">
                    {localization.light}
                  </Txt>
                </Box>
              </Radio>
            )}

            {themes.includes("dark") && (
              <Radio
                value="dark"
                className={cn(
                  "rounded-xl border border-transparent px-4 py-3",
                  variant === "transparent"
                    ? "bg-surface"
                    : "bg-surface-secondary"
                )}
              >
                <Box className="flex-1 flex-row items-center gap-2">
                  <Moon className="text-muted" />
                  <Txt className="text-sm text-foreground">
                    {localization.dark}
                  </Txt>
                </Box>
              </Radio>
            )}
          </RadioGroup>
        </Card.Content>
      </Card>
    </Box>
  )
}
