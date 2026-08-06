import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useListDeviceSessions } from "@better-auth-ui/react/plugins/multi-session"
import { Card, type CardProps, cn } from "@heroui/react"

import { multiSessionPlugin } from "../../../lib/auth/multi-session-plugin"

import { ManageAccount } from "./manage-account"

export type ManageAccountsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card that lists and manages all device sessions for the current user.
 *
 * Shows each session with user information and actions to switch to or revoke a session.
 * When device session data is loading, a pending placeholder row is displayed.
 *
 * @returns A JSX element containing the accounts management card
 */
export function ManageAccounts({
  className,
  variant,
  ...props
}: ManageAccountsProps & Omit<CardProps, "children">) {
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
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {multiSessionLocalization.manageAccounts}
      </h2>

      <Card className={cn(className)} variant={variant} {...props}>
        <Card.Content className="gap-0">
          {allRows.map((row, index) => (
            <div key={row.key}>
              {index > 0 && (
                <div className="border-b border-dashed -mx-4 my-4" />
              )}

              <ManageAccount
                deviceSession={row.deviceSession}
                isPending={row.isPending}
              />
            </div>
          ))}
        </Card.Content>
      </Card>
    </div>
  )
}
