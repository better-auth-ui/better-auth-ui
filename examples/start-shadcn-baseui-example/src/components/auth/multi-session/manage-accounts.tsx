"use client"

import {
  type MultiSessionAuthClient,
  useAuth,
  useAuthPlugin,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { cn } from "@/lib/utils"
import { ManageAccount } from "./manage-account"

export type ManageAccountsProps = {
  className?: string
}

/**
 * Render a card that lists and manages all device sessions for the current user.
 *
 * Shows each session with user information and actions to switch to or revoke a session.
 * When device session data is loading, a pending placeholder row is displayed.
 *
 * @returns A JSX element containing the accounts management card
 */
export function ManageAccounts({ className }: ManageAccountsProps) {
  const { authClient } = useAuth()
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const { data: session } = useSession(authClient)

  const { data: deviceSessions, isPending } = useListDeviceSessions(
    authClient as MultiSessionAuthClient
  )

  const otherSessions = deviceSessions?.filter(
    (deviceSession) => deviceSession.session.id !== session?.session.id
  )

  const allRows = [
    {
      key: session?.session.id ?? "current",
      deviceSession: !isPending ? session : null,
      isPending
    },
    ...(otherSessions?.map((deviceSession) => ({
      key: deviceSession.session.id,
      deviceSession,
      isPending: false
    })) ?? [])
  ]

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {multiSessionLocalization.manageAccounts}
      </h2>

      <Card className={cn("p-0", className)}>
        <CardContent className="p-0">
          {allRows.map((row, index) => (
            <div key={row.key}>
              {index > 0 && <Separator />}

              <ManageAccount
                deviceSession={row.deviceSession}
                isPending={row.isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
