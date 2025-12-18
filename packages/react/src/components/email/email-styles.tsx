/**
 * Default color scheme for email templates in light and dark modes.
 *
 * Provides a consistent color palette that can be customized via the EmailColors type.
 */
export const defaultColors = {
  light: {
    background: "#F5F5F5",
    border: "#E5E5E5",
    card: "#FFFFFF",
    cardForeground: "#0A0A0A",
    foreground: "#262626",
    muted: "#F5F5F5",
    mutedForeground: "#737373",
    primary: "#171717",
    primaryForeground: "#FAFAFA"
  },
  dark: {
    background: "#0A0A0A",
    border: "#2E2E2E",
    card: "#171717",
    cardForeground: "#FAFAFA",
    foreground: "#D4D4D4",
    muted: "#212121",
    mutedForeground: "#A1A1A1",
    primary: "#E5E5E5",
    primaryForeground: "#171717"
  }
}

/**
 * Custom CSS class names for styling different parts of email templates.
 *
 * Allows fine-grained control over the appearance of email components.
 */
export type EmailClassNames = {
  body?: string
  container?: string
  card?: string
  logo?: string
  title?: string
  content?: string
  button?: string
  description?: string
  separator?: string
  link?: string
  poweredBy?: string
  codeBlock?: string
}

/**
 * Custom color scheme configuration for email templates.
 *
 * Supports separate color definitions for light and dark modes.
 * Any color not specified will fall back to the defaultColors values.
 */
export type EmailColors = {
  light?: Partial<typeof defaultColors.light>
  dark?: Partial<typeof defaultColors.dark>
}

/**
 * Props for the EmailStyles component.
 */
interface EmailStylesProps {
  /** Custom color scheme for light and dark modes */
  colors?: EmailColors
  /** Whether to enable dark mode support */
  darkMode?: boolean
}

/**
 * Component that injects CSS styles for email templates with support for light and dark modes.
 *
 * Generates inline styles that adapt to the user's color scheme preference and applies
 * custom colors if provided. Handles logo visibility switching between light and dark modes.
 *
 * @param props - Style configuration options
 * @returns A style element containing CSS for email template theming
 *
 * @example
 * ```tsx
 * <EmailStyles
 *   colors={{
 *     light: { primary: "#000000" },
 *     dark: { primary: "#FFFFFF" }
 *   }}
 *   darkMode={true}
 * />
 * ```
 */
export const EmailStyles = ({ colors, darkMode = true }: EmailStylesProps) => {
  return (
    <style type="text/css">{`
      .bg-background {
        background-color: ${colors?.light?.background || defaultColors.light.background} !important;
      }
      .bg-card {
        background-color: ${colors?.light?.card || defaultColors.light.card} !important;
      }
      .bg-primary {
        background-color: ${colors?.light?.primary || defaultColors.light.primary} !important;
      }
      .bg-muted {
        background-color: ${colors?.light?.muted || defaultColors.light.muted} !important;
      }
      .border-border {
        border-color: ${colors?.light?.border || defaultColors.light.border} !important;
      }
      .text-card-foreground {
        color: ${colors?.light?.cardForeground || defaultColors.light.cardForeground} !important;
      }
      .text-muted-foreground {
        color: ${colors?.light?.mutedForeground || defaultColors.light.mutedForeground} !important;
      }
      .text-primary {
        color: ${colors?.light?.primary || defaultColors.light.primary} !important;
      }
      .text-primary-foreground {
        color: ${colors?.light?.primaryForeground || defaultColors.light.primaryForeground} !important;
      }
      .logo-dark {
        display: none !important;
      }
      .logo-light {
        display: block !important;
      }

      ${
        darkMode
          ? `@media (prefers-color-scheme: dark) {
        .bg-background {
          background-color: ${colors?.dark?.background || defaultColors.dark.background} !important;
        }
        .bg-card {
          background-color: ${colors?.dark?.card || defaultColors.dark.card} !important;
        }
        .bg-primary {
          background-color: ${colors?.dark?.primary || defaultColors.dark.primary} !important;
        }
        .bg-muted {
          background-color: ${colors?.dark?.muted || defaultColors.dark.muted} !important;
        }
        .border-border {
          border-color: ${colors?.dark?.border || defaultColors.dark.border} !important;
        }
        .text-card-foreground {
          color: ${colors?.dark?.cardForeground || defaultColors.dark.cardForeground} !important;
        }
        .text-muted-foreground {
          color: ${colors?.dark?.mutedForeground || defaultColors.dark.mutedForeground} !important;
        }
        .text-primary {
          color: ${colors?.dark?.primary || defaultColors.dark.primary} !important;
        }
        .text-primary-foreground {
          color: ${colors?.dark?.primaryForeground || defaultColors.dark.primaryForeground} !important;
        }
        .logo-dark {
          display: block !important;
        }
        .logo-light {
          display: none !important;
        }
        * {
          box-shadow: none !important;
        }
      }`
          : ""
      }
    `}</style>
  )
}

export default EmailStyles
