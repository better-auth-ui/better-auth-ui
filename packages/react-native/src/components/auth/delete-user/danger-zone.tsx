import { useAuth } from "@better-auth-ui/react"

import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { Box, Txt } from "../../../primitives/styled"
import { DeleteAccount } from "./delete-account"

export type DangerZoneProps = SettingsViewProps

/**
 * Renders the danger zone heading and {@link DeleteAccount}.
 * Registered as a `securityCard` by `deleteUserPlugin()`; gate by registering the plugin.
 */
export function DangerZone({ className, variant }: DangerZoneProps) {
  const { localization } = useAuth()

  return (
    <Box className={cn("flex w-full flex-col", className)}>
      <Txt className="mb-3 text-sm font-semibold text-danger">
        {localization.settings.dangerZone}
      </Txt>

      <DeleteAccount variant={variant} />
    </Box>
  )
}
