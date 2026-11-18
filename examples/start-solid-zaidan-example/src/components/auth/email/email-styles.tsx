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

export type EmailColors = {
  light?: Partial<typeof defaultColors.light>
  dark?: Partial<typeof defaultColors.dark>
}

type EmailStylesProps = {
  colors?: EmailColors
  darkMode?: boolean
}

export function EmailStyles(props: EmailStylesProps) {
  const darkMode = () => props.darkMode ?? true

  return (
    <style>{`
      .font-sans {
        font-family: Arial, Helvetica, sans-serif !important;
      }
      .bg-background {
        background-color: ${props.colors?.light?.background || defaultColors.light.background} !important;
      }
      .bg-card {
        background-color: ${props.colors?.light?.card || defaultColors.light.card} !important;
      }
      .bg-primary {
        background-color: ${props.colors?.light?.primary || defaultColors.light.primary} !important;
      }
      .bg-muted {
        background-color: ${props.colors?.light?.muted || defaultColors.light.muted} !important;
      }
      .border-border {
        border-color: ${props.colors?.light?.border || defaultColors.light.border} !important;
      }
      .text-card-foreground {
        color: ${props.colors?.light?.cardForeground || defaultColors.light.cardForeground} !important;
      }
      .text-muted-foreground {
        color: ${props.colors?.light?.mutedForeground || defaultColors.light.mutedForeground} !important;
      }
      .text-primary {
        color: ${props.colors?.light?.primary || defaultColors.light.primary} !important;
      }
      .text-primary-foreground {
        color: ${props.colors?.light?.primaryForeground || defaultColors.light.primaryForeground} !important;
      }
      .logo-dark {
        display: none !important;
      }
      .logo-light {
        display: block !important;
      }

      ${
        darkMode()
          ? `@media (prefers-color-scheme: dark) {
        .bg-background {
          background-color: ${props.colors?.dark?.background || defaultColors.dark.background} !important;
        }
        .bg-card {
          background-color: ${props.colors?.dark?.card || defaultColors.dark.card} !important;
        }
        .bg-primary {
          background-color: ${props.colors?.dark?.primary || defaultColors.dark.primary} !important;
        }
        .bg-muted {
          background-color: ${props.colors?.dark?.muted || defaultColors.dark.muted} !important;
        }
        .border-border {
          border-color: ${props.colors?.dark?.border || defaultColors.dark.border} !important;
        }
        .text-card-foreground {
          color: ${props.colors?.dark?.cardForeground || defaultColors.dark.cardForeground} !important;
        }
        .text-muted-foreground {
          color: ${props.colors?.dark?.mutedForeground || defaultColors.dark.mutedForeground} !important;
        }
        .text-primary {
          color: ${props.colors?.dark?.primary || defaultColors.dark.primary} !important;
        }
        .text-primary-foreground {
          color: ${props.colors?.dark?.primaryForeground || defaultColors.dark.primaryForeground} !important;
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
