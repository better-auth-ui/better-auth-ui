import {
  useAuth,
  useListSessions,
  useRevokeSession,
  useSession
} from "@better-auth-ui/react"
import { ArrowRightFromSquare, Display, Smartphone } from "@gravity-ui/icons"
import { Button, Card, Chip, cn, Skeleton, Spinner } from "@heroui/react"
import { UAParser } from "ua-parser-js"

export type SessionsProps = {
  className?: string
}

/**
 * Render a card listing all active sessions for the current user with revoke controls.
 *
 * Shows each session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @returns A JSX element containing the sessions card
 */
export function Sessions({ className }: SessionsProps) {
  const { basePaths, localization, viewPaths, navigate } = useAuth()

  const { data: sessionData } = useSession()
  const { data: sessions, isPending } = useListSessions()
  const { revokingSession, revokeSession } = useRevokeSession()

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.sessions}
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
            .map((session) => {
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
                  className="flex items-center rounded-3xl border-2 p-3 gap-3 border-default"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
                    {isMobile ? (
                      <Smartphone className="size-5" />
                    ) : (
                      <Display className="size-5" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
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

                  <Button
                    isIconOnly
                    className="ml-auto"
                    variant="ghost"
                    size="sm"
                    onPress={() =>
                      isCurrentSession
                        ? navigate(
                            `${basePaths.auth}/${viewPaths.auth.signOut}`
                          )
                        : revokeSession(session.token)
                    }
                    isPending={!!revokingSession}
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
