import { isReauthenticationRequiredError } from "@better-auth-ui/core"
import { useAuth, useListSessions, useSession } from "@better-auth-ui/react"
import { Card, type CardProps, cn, Skeleton } from "@heroui/react"
import type { BetterFetchError } from "better-auth/client"
import { ReauthenticationAction } from "../../reauthentication"
import { ActiveSession } from "./active-session"
import { SessionActions } from "./session-actions"

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
  variant,
  ...props
}: ActiveSessionsProps & Omit<CardProps, "children">) {
  const { authClient, localization } = useAuth()
  const { data: session } = useSession(authClient)

  const sessionsQuery = useListSessions(authClient, {
    meta: { errorPresentation: "inline" }
  })
  const { data: sessions, error, isPending } = sessionsQuery

  const activeSessions =
    sessions &&
    [...sessions].sort((a, b) =>
      a.id === session?.session.id ? -1 : b.id === session?.session.id ? 1 : 0
    )

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.activeSessions}
      </h2>

      <Card className={cn("gap-0", className)} variant={variant} {...props}>
        <Card.Content className="gap-0 p-0">
          {isReauthenticationRequiredError(error) ? (
            <ReauthenticationAction />
          ) : error ? (
            <div className="p-4 text-danger text-sm">
              {(error as BetterFetchError).error?.message ?? error.message}
            </div>
          ) : isPending ? (
            <SessionRowSkeleton />
          ) : (
            activeSessions?.map((activeSession) => (
              <div
                className="border-b border-divider px-4 py-3 last:border-b-0"
                key={activeSession.id}
              >
                <ActiveSession activeSession={activeSession} />
              </div>
            ))
          )}
        </Card.Content>

        {!isPending && !error && (
          <SessionActions
            hasOtherSessions={
              activeSessions?.some(
                (activeSession) => activeSession.id !== session?.session.id
              ) ?? false
            }
          />
        )}
      </Card>
    </div>
  )
}

function SessionRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
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
