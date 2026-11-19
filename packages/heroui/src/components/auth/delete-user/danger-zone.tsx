import { useAuth } from "@better-auth-ui/react"
import { type CardProps, cn } from "@heroui/react"
import type { ComponentProps, JSX } from "react"

import { DeleteAccount } from "./delete-account"

export type DangerZoneProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders the danger zone heading and {@link DeleteAccount}.
 * Registered as a `securityCard` by `deleteUserPlugin()`; gate by registering the plugin.
 */
export function DangerZone({
  className,
  variant,
  ...props
}: DangerZoneProps & ComponentProps<"div">): JSX.Element {
  const { localization } = useAuth()

  return (
    <div className={cn("flex w-full flex-col", className)} {...props}>
      <h2 className={cn("text-sm font-semibold mb-3 text-danger")}>
        {localization.settings.dangerZone}
      </h2>

      <DeleteAccount variant={variant} />
    </div>
  )
}
