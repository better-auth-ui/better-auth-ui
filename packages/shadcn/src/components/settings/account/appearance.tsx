"use client"

import {
  ThemePreviewDark,
  ThemePreviewLight,
  ThemePreviewSystem,
  useAuth
} from "@better-auth-ui/react"
import { Monitor, Moon, Sun } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useHydrated } from "@/hooks/use-hydrated"
import { cn } from "@/lib/utils"

export type AppearanceProps = {
  className?: string
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
export function Appearance({ className }: AppearanceProps) {
  const {
    localization,
    settings: { theme, setTheme, themes }
  } = useAuth()

  const hydrated = useHydrated()

  if (!setTheme || !themes?.length) {
    return null
  }

  return (
    <Card className={cn("py-4 md:py-6 gap-4", className)}>
      <CardHeader className="px-4 md:px-6 gap-0">
        <CardTitle className="text-xl">
          {localization.settings.appearance}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6">
        <Label className="mb-4">{localization.settings.theme}</Label>

        <RadioGroup
          value={hydrated ? theme : ""}
          onValueChange={setTheme}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          disabled={!hydrated}
        >
          {themes.includes("system") && (
            <FieldLabel htmlFor="system">
              <Field orientation="horizontal">
                <FieldContent className="gap-3">
                  <FieldTitle>
                    <Monitor className="size-4 text-muted-foreground" />
                    {localization.settings.system}
                  </FieldTitle>

                  <ThemePreviewSystem className="w-full" />
                </FieldContent>

                <RadioGroupItem value="system" id="system" />
              </Field>
            </FieldLabel>
          )}

          {themes.includes("light") && (
            <FieldLabel htmlFor="light">
              <Field orientation="horizontal">
                <FieldContent className="gap-3">
                  <FieldTitle>
                    <Sun className="size-4 text-muted-foreground" />

                    {localization.settings.light}
                  </FieldTitle>

                  <ThemePreviewLight className="w-full" />
                </FieldContent>

                <RadioGroupItem value="light" id="light" />
              </Field>
            </FieldLabel>
          )}

          {themes.includes("dark") && (
            <FieldLabel htmlFor="dark">
              <Field orientation="horizontal">
                <FieldContent className="gap-3">
                  <FieldTitle>
                    <Moon className="size-4 text-muted-foreground" />

                    {localization.settings.dark}
                  </FieldTitle>
                  <ThemePreviewDark className="w-full" />
                </FieldContent>

                <RadioGroupItem value="dark" id="dark" />
              </Field>
            </FieldLabel>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
