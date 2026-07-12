import {
  type MultiSessionAuthClient,
  useAuth,
  useAuthPlugin,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"
import { Text, View } from "react-native"
import { multiSessionPlugin } from "../../../lib/auth/multi-session-plugin"
import { cn } from "../../../lib/cn"
import { Card, type CardVariant } from "../../../primitives/card"
import { ManageAccount } from "./manage-account"

export type ManageAccountsProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Render a card that lists and manages all device sessions for the current user.
 *
 * Shows each session with user information and actions to switch to or revoke a session.
 * When device session data is loading, a pending placeholder row is displayed.
 *
 * @returns A JSX element containing the accounts management card
 */
export function ManageAccounts({ className, variant }: ManageAccountsProps) {
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
    <View>
      <Text className="mb-3 text-sm font-semibold text-foreground">
        {multiSessionLocalization.manageAccounts}
      </Text>

      <Card className={cn(className)} variant={variant}>
        <Card.Content className="gap-0">
          {allRows.map((row, index) => (
            <View key={row.key}>
              {index > 0 && (
                <View className="-mx-4 my-4 border-b border-dashed border-border" />
              )}

              <ManageAccount
                deviceSession={row.deviceSession}
                isPending={row.isPending}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  )
}
