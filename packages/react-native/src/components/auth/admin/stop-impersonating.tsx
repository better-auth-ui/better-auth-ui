import {
  isImpersonatingSession,
  type AdminAuthClient
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useStopImpersonating } from "@better-auth-ui/react/plugins/admin"
import { adminPlugin } from "../../../lib/auth/admin-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { Button } from "../../../primitives/button"

export function StopImpersonating(props: CardSlotProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(adminPlugin)
  const session = useSession(authClient)
  const stop = useStopImpersonating(authClient as AdminAuthClient)
  return isImpersonatingSession(session.data) ? (
    <Button
      className={props.className}
      isPending={stop.isPending}
      onPress={() => stop.mutate(undefined)}
    >
      {localization.stopImpersonating}
    </Button>
  ) : null
}
