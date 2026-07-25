import { isImpersonatingSession } from "@better-auth-ui/core/plugins"
import {
  type AdminAuthClient,
  useAuth,
  useAuthPlugin,
  useSession,
  useStopImpersonating
} from "@better-auth-ui/react"
import { ArrowRotateLeft } from "@gravity-ui/icons"
import { Dropdown, Label, Spinner } from "@heroui/react"

import { adminPlugin } from "../../../lib/auth/admin-plugin"

export type StopImpersonatingProps = {
  className?: string
}

/**
 * Restore the administrator's session when the current session is
 * impersonating another user.
 */
export function StopImpersonating({ className }: StopImpersonatingProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(adminPlugin)
  const { data: session } = useSession(authClient)
  const stopImpersonating = useStopImpersonating(authClient as AdminAuthClient)

  if (!isImpersonatingSession(session)) {
    return null
  }

  return (
    <Dropdown.Item
      className={className}
      isDisabled={stopImpersonating.isPending}
      onPress={() => stopImpersonating.mutate(undefined)}
      textValue={localization.stopImpersonating}
    >
      {stopImpersonating.isPending ? (
        <Spinner color="current" size="sm" />
      ) : (
        <ArrowRotateLeft className="text-muted" />
      )}

      <Label>{localization.stopImpersonating}</Label>
    </Dropdown.Item>
  )
}
