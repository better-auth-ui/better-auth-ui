"use client"

import {
  type AdminAuthClient,
  isImpersonatingSession
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useStopImpersonating } from "@better-auth-ui/react/plugins/admin"
import { UserRoundCheck } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { adminPlugin } from "@/lib/auth/admin-plugin"

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
    <DropdownMenuItem
      className={className}
      disabled={stopImpersonating.isPending}
      onClick={() => stopImpersonating.mutate(undefined)}
    >
      {stopImpersonating.isPending ? (
        <Spinner />
      ) : (
        <UserRoundCheck className="text-muted-foreground" />
      )}

      {localization.stopImpersonating}
    </DropdownMenuItem>
  )
}
