import {
  type AnyAuthConfig,
  useListSessions,
  useRevokeSession,
  useSession
} from "@better-auth-ui/react"
import { ArrowRightFromSquare, Display, Smartphone } from "@gravity-ui/icons"
import { Button, Card, Chip, cn, Skeleton, Spinner } from "@heroui/react"
import { UAParser } from "ua-parser-js"

import { useAuth } from "../../../hooks/use-auth"

export type SessionsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Display and manage all active sessions (devices where user is logged in).
 *
 * Shows all active sessions with browser/OS info, IP address, and last active time.
 * Users can revoke any session except the current one.
 *
 * @returns A JSX element containing the sessions card
 */
export function Sessions({ className, ...config }: SessionsProps) {
  const context = useAuth(config)
  const { localization } = context

  const { data: sessionData } = useSession(context)
  const { data: sessions, isPending: isLoadingSessions } =
    useListSessions(context)
  const { revokingSession, revokeSession } = useRevokeSession(context)

  const isLoading = !sessionData || isLoadingSessions

  // Sort sessions so current session is first
  const sortedSessions = sessions
    ? [
        ...(sessionData?.session ? [sessionData.session] : []),
        ...sessions.filter((s) => s.token === sessionData?.session.token),
        ...sessions.filter((s) => s.token !== sessionData?.session.token)
      ]
    : []

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.sessions}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
        {isLoading ? (
          <SessionRowSkeleton />
        ) : (
          sortedSessions.map((session) => {
            const isCurrentSession =
              session.token === sessionData?.session.token
            const isRevoking = revokingSession === session.token
            const ua = new UAParser(session.userAgent || "").getResult()
            const isMobile =
              ua.device.type === "mobile" ||
              ua.device.type === "tablet" ||
              ua.device.type === "wearable"

            return (
              <div
                key={session.id}
                className={cn(
                  "flex items-center rounded-3xl border-2 p-3 justify-between border-default"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-default">
                    {isMobile ? (
                      <Smartphone className="size-5" />
                    ) : (
                      <Display className="size-5" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {ua.browser.name || "Unknown Browser"}
                        {ua.os.name ? `, ${ua.os.name}` : ""}
                      </span>

                      {isCurrentSession && (
                        <Chip color="accent" size="sm" className="px-1.5">
                          {localization.settings.currentSession}
                        </Chip>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      {session.ipAddress && <span>{session.ipAddress}</span>}

                      {session.createdAt && (
                        <>
                          {session.ipAddress && <span>•</span>}
                          <span>{session.createdAt.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => revokeSession(session.token)}
                  isPending={isRevoking}
                  isDisabled={!!revokingSession}
                  aria-label={localization.settings.revokeSession}
                >
                  {isRevoking ? (
                    <Spinner color="current" size="sm" />
                  ) : (
                    <ArrowRightFromSquare />
                  )}
                </Button>
              </div>
            )
          })
        )}
      </Card.Content>
    </Card>
  )
}

function SessionRowSkeleton() {
  return (
    <div className="flex items-center rounded-3xl border-2 border-default p-3 justify-between">
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
