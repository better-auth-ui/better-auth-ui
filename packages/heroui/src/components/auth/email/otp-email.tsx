import {
  OtpEmail as OtpEmailPrimitive,
  type OtpEmailProps
} from "@better-auth-ui/react/email"
import { cn } from "@heroui/react"
import type { JSX } from "react/jsx-runtime"

export type { OtpEmailProps } from "@better-auth-ui/react/email"

export function OtpEmail({
  colors,
  classNames,
  ...props
}: OtpEmailProps): JSX.Element {
  return (
    <OtpEmailPrimitive
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
        card: cn("border-none rounded-3xl", classNames?.card)
      }}
      {...props}
    />
  )
}
