import {
  type AnyAuthConfig,
  useAuth,
  useListDeviceSessions
} from "@better-auth-ui/react"
import {
  ArrowRightArrowLeft,
  ArrowRightFromSquare,
  CirclePlus
} from "@gravity-ui/icons"

import {
  Button,
  buttonVariants,
  Card,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useState } from "react"

import { UserView } from "../../user/user-view"

export type AccountsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Display and manage multiple signed-in accounts for multi-session support.
 *
 * Shows all device sessions, allows switching between accounts, and signing out
 * of individual accounts. Only renders when multiSession is enabled.
 *
 * @returns A JSX element containing the accounts card, or null if multiSession is disabled
 */
export function Accounts({ className, ...config }: AccountsProps) {
  const { authClient, basePaths, localization, toast, viewPaths, Link } =
    useAuth(config)

  const { data: sessionData, refetch } = authClient.useSession()

  const { data: deviceSessions, refetch: refetchDeviceSessions } =
    useListDeviceSessions(config)

  const [switchingSession, setSwitchingSession] = useState<string | null>(null)
  const [revokingSession, setRevokingSession] = useState<string | null>(null)

  const handleSwitchAccount = async (sessionToken: string) => {
    setSwitchingSession(sessionToken)

    const { error } = await authClient.multiSession.setActive({
      sessionToken
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      await refetch()
      await refetchDeviceSessions()
    }

    setSwitchingSession(null)
  }

  const handleSignOut = async (sessionToken: string) => {
    setRevokingSession(sessionToken)

    const { error } = await authClient.multiSession.revoke({
      sessionToken
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      await refetchDeviceSessions()
    }

    setRevokingSession(null)
  }

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.accounts}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
        {sessionData && deviceSessions ? (
          [
            sessionData,
            ...deviceSessions.filter(
              (session) => session.session.id !== sessionData.session.id
            )
          ]?.map((session) => {
            const isActive = session.session.id === sessionData.session.id
            const isSwitching = switchingSession === session.session.token
            const isRevoking = revokingSession === session.session.token

            return (
              <div
                key={session.session.id}
                className={cn(
                  "flex items-center rounded-3xl border-2 border-default p-3 justify-between"
                )}
              >
                <UserView {...config} user={session.user} size="md" />

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive && (
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      onPress={() => handleSwitchAccount(session.session.token)}
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
                    onPress={() => handleSignOut(session.session.token)}
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
          <div className="flex items-center gap-2 p-3 rounded-3xl border-2 border-surface-tertiary">
            <Skeleton className="size-10 rounded-full" />

            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-lg" />
            </div>
          </div>
        )}
      </Card.Content>

      <Card.Footer>
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
          className={buttonVariants({ variant: "secondary" })}
        >
          <CirclePlus />

          {localization.auth.addAccount}
        </Link>
      </Card.Footer>
    </Card>
  )
}
