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
import { Button, Card, cn, Skeleton, Spinner } from "@heroui/react"
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
  const {
    authClient,
    basePaths,
    Link,
    localization,
    multiSession,
    toast,
    viewPaths
  } = useAuth(config)

  const {
    data: sessionData,
    isPending: isSessionPending,
    refetch
  } = authClient.useSession()
  const {
    data: deviceSessions,
    isPending: isDeviceSessionsPending,
    refetch: refetchDeviceSessions
  } = useListDeviceSessions(config)

  const [switchingSession, setSwitchingSession] = useState<string | null>(null)
  const [revokingSession, setRevokingSession] = useState<string | null>(null)

  if (!multiSession) {
    return null
  }

  if (isSessionPending || isDeviceSessionsPending) {
    return <AccountsSkeleton />
  }

  const handleSwitchAccount = async (sessionToken: string) => {
    setSwitchingSession(sessionToken)

    try {
      const { error } = await authClient.multiSession.setActive({
        sessionToken
      })

      if (error) {
        toast.error(error.message || error.statusText)
      } else {
        await refetch()
        await refetchDeviceSessions()
      }
    } finally {
      setSwitchingSession(null)
    }
  }

  const handleSignOut = async (sessionToken: string) => {
    setRevokingSession(sessionToken)

    try {
      const { error } = await authClient.multiSession.revoke({
        sessionToken
      })

      if (error) {
        toast.error(error.message || error.statusText)
      } else {
        await refetchDeviceSessions()
      }
    } finally {
      setRevokingSession(null)
    }
  }

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.accounts}
        </Card.Title>
      </Card.Header>

      <Card.Content className="flex flex-col gap-2 md:gap-4">
        {sessionData &&
          [sessionData, ...(deviceSessions || [])]?.map((session) => {
            const isActive = session.session.id === sessionData?.session.id
            const isSwitching = switchingSession === session.session.token
            const isRevoking = revokingSession === session.session.token

            return (
              <div
                key={session.session.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 border-surface-tertiary p-3 overflow-hidden justify-between"
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
                      isDisabled={isSwitching || isRevoking}
                      aria-label={localization.auth.switchAccount}
                    >
                      {isSwitching ? (
                        <Spinner color="current" size="sm" />
                      ) : (
                        <ArrowRightArrowLeft className="size-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    onPress={() => handleSignOut(session.session.token)}
                    isDisabled={isSwitching || isRevoking}
                    aria-label={localization.auth.signOut}
                  >
                    {isRevoking ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      <ArrowRightFromSquare className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
      </Card.Content>

      <Card.Footer>
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
          className="button button--md button--secondary"
        >
          <CirclePlus />
          {localization.auth.addAccount}
        </Link>
      </Card.Footer>
    </Card>
  )
}

/**
 * Renders a skeleton placeholder that matches the Accounts layout while data is loading.
 *
 * @returns A Card element containing skeleton UI blocks that visually represent the accounts list during loading.
 */
function AccountsSkeleton() {
  return (
    <Card className="p-4 md:p-6 gap-4 md:gap-6">
      <Skeleton className="h-7 w-24 rounded-xl" />

      <div className="-mt-1 flex items-center gap-2 p-3 rounded-xl border-2 border-surface-tertiary">
        <Skeleton className="size-10 rounded-full" />

        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-10 md:h-9 w-36 rounded-full" />
    </Card>
  )
}
