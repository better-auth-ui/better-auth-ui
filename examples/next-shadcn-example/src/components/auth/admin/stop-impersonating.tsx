"use client"

import {
  type AdminAuthClient,
  isImpersonatingSession,
  adminPlugin
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useStopImpersonating } from "@better-auth-ui/react/plugins/admin"
import { UserRoundCheck } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"

export type StopImpersonatingProps = {
  className?: string
}

/**
 * Restore the administrator's session when the current session is
 * impersonating another user.
 */
export function StopImpersonating({ className }: StopImpersonatingProps) {
  const { authClient } = useAuth<AdminAuthClient>()
  const { localization } = useAuthPlugin(adminPlugin)
  const { data: session } = useSession(authClient)
  const stopImpersonating = useStopImpersonating(authClient)

  if (!isImpersonatingSession(session)) {
    return null
  }

  return (
    <DropdownMenuItem
      className={className}
      disabled={stopImpersonating.isPending}
      onClick={() => {
        stopImpersonating.mutate(undefined)
      }}
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
