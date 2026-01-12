import {
  useAuth,
  useListDeviceSessions,
  useRevokeMultiSession,
  useSession,
  useSetActiveSession
} from "@better-auth-ui/react"
import {
  ArrowRightArrowLeft,
  ArrowRightFromSquare,
  CirclePlus
} from "@gravity-ui/icons"
import { Button, buttonVariants, Card, cn, Spinner } from "@heroui/react"

import { UserView } from "../../user/user-view"

export type AccountsProps = {
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
export function Accounts({ className }: AccountsProps) {
  const { basePaths, localization, viewPaths, Link } = useAuth()
  const { data: sessionData } = useSession()
  const { data: deviceSessions, isPending } = useListDeviceSessions()
  const { settingActiveSession, setActiveSession } = useSetActiveSession()
  const { revokingSession, revokeSession } = useRevokeMultiSession()

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.accounts}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
        {sessionData && !isPending ? (
          [
            sessionData,
            ...(deviceSessions || []).filter(
              (deviceSession) =>
                deviceSession.session.id !== sessionData.session.id
            )
          ].map((deviceSession) => {
            const isActive = deviceSession.session.id === sessionData.session.id
            const isSwitching =
              settingActiveSession === deviceSession.session.token
            const isRevoking = revokingSession === deviceSession.session.token

            return (
              <div
                key={deviceSession.session.id}
                className="flex items-center rounded-3xl border-2 border-default p-3 justify-between"
              >
                <UserView user={deviceSession.user} size="md" />

                <div className="flex items-center gap-1 shrink-0">
                  {!isActive && (
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      onPress={() =>
                        setActiveSession(deviceSession.session.token)
                      }
                      isPending={isSwitching || isRevoking}
                      aria-label={localization.auth.switchAccount}
                    >
                      {isSwitching ? (
                        <Spinner color="current" size="sm" />
                      ) : (
                        <ArrowRightArrowLeft />
                      )}
                    </Button>
                  )}

                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    onPress={() => revokeSession(deviceSession.session.token)}
                    isPending={isSwitching || isRevoking}
                    aria-label={localization.auth.signOut}
                  >
                    {isRevoking ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      <ArrowRightFromSquare />
                    )}
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex items-center rounded-3xl border-2 border-default p-3">
            <UserView isPending size="md" />
          </div>
        )}
      </Card.Content>

      <Card.Footer>
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
          className={cn(
            buttonVariants({ variant: "secondary" }),
            isPending && "status-disabled"
          )}
        >
          <CirclePlus />

          {localization.auth.addAccount}
        </Link>
      </Card.Footer>
    </Card>
  )
}