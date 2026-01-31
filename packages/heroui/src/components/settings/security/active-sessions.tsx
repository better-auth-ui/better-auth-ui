import { useAuth, useListSessions, useSession } from "@better-auth-ui/react"
import { Card, type CardProps, cn, Skeleton, toast } from "@heroui/react"
import { ActiveSession } from "./active-session"

export type ActiveSessionsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card listing all active sessions for the current user with revoke controls.
 *
 * Shows each session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @returns A JSX element containing the sessions card
 */
export function ActiveSessions({
  className,
  ...props
}: ActiveSessionsProps & CardProps) {
  const { localization } = useAuth()
  const { data: sessionData } = useSession()

  const { data: sessions, isPending } = useListSessions({
    throwOnError: (error) => {
      if (error.error) toast.danger(error.error.message, { timeout: 3000 })
      return false
    }
  })

  return (
    <Card className={cn("p-4 md:p-6 gap-4", className)} {...props}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.activeSessions}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
        {isPending ? (
          <SessionRowSkeleton />
        ) : (
          sessions
            ?.toSorted((session) =>
              session.id === sessionData?.session.id ? -1 : 1
            )
            .map((session) => (
              <ActiveSession key={session.id} session={session} />
            ))
        )}
      </Card.Content>
    </Card>
  )
}

function SessionRowSkeleton() {
  return (
    <div className="flex items-center rounded-3xl border p-3 justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
