import {
  MagicLinkEmail as MagicLinkEmailPrimitive,
  type MagicLinkEmailProps
} from "@better-auth-ui/react"
import { cn } from "@heroui/react"

export type { MagicLinkEmailProps } from "@better-auth-ui/react"

export function MagicLinkEmail({
  colors,
  classNames,
  ...props
}: MagicLinkEmailProps) {
  return (
    <MagicLinkEmailPrimitive
      colors={{
        light: {
          background: "#F5F5F5",
          primary: "#0285F7",
          primaryForeground: "#FCFCFC",
          ...colors?.light
        },
        dark: {
          background: "#060607",
          primary: "#0584F6",
          primaryForeground: "#FCFCFC",
          ...colors?.dark
        }
      }}
      classNames={{
        ...classNames,
        card: cn("border-none rounded-3xl", classNames?.card),
        button: cn("rounded-full", classNames?.button)
      }}
      {...props}
    />
  )
}
