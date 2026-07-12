import { useAuth, useListSessions, useSession } from "@better-auth-ui/react"
import { Text, View } from "react-native"
import { cn } from "../../../../lib/cn"
import { Card, type CardVariant } from "../../../../primitives/card"
import { Separator } from "../../../../primitives/separator"
import { Skeleton } from "../../../../primitives/skeleton"
import { ActiveSession } from "./active-session"

export type ActiveSessionsProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Render a card listing all active sessions for the current user with revoke controls.
 *
 * Shows each session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @returns A JSX element containing the sessions card
 */
export function ActiveSessions({ className, variant }: ActiveSessionsProps) {
  const { authClient, localization } = useAuth()
  const { data: session } = useSession(authClient)

  const { data: sessions, isPending } = useListSessions(authClient)

  const activeSessions =
    sessions &&
    [...sessions].sort((a, b) =>
      a.id === session?.session.id ? -1 : b.id === session?.session.id ? 1 : 0
    )

  return (
    <View>
      <Text className={cn("text-sm font-semibold mb-3 text-foreground")}>
        {localization.settings.activeSessions}
      </Text>

      <Card className={cn(className)} variant={variant}>
        <Card.Content className="gap-0">
          {isPending ? (
            <SessionRowSkeleton />
          ) : (
            activeSessions?.map((activeSession, index) => (
              <View key={activeSession.id}>
                {index > 0 && <Separator className="my-4" />}

                <ActiveSession activeSession={activeSession} />
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </View>
  )
}

function SessionRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <View className="flex-col gap-1">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </View>
      </View>
    </View>
  )
}
