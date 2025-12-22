"use client"

import {
  type AnyAuthConfig,
  useListDeviceSessions,
  useRevokeSession,
  useSetActiveSession
} from "@better-auth-ui/react"
import { ArrowLeftRight, LogOut, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { UserView } from "@/components/user/user-view"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

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
  const context = useAuth(config)
  const { authClient, basePaths, localization, viewPaths, Link } = context

  const { data: sessionData } = authClient.useSession()
  const { data: deviceSessions, isPending } = useListDeviceSessions(context)
  const { settingActiveSession, setActiveSession } =
    useSetActiveSession(context)
  const { revokingSession, revokeSession } = useRevokeSession(context)

  return (
    <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
      <CardHeader className="px-4 md:px-6 gap-0">
        <CardTitle className="text-xl">
          {localization.settings.accounts}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6 grid gap-3">
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
                className="h-15 flex items-center rounded-xl border p-3 justify-between"
              >
                <UserView {...config} user={deviceSession.user} />

                <div className="flex items-center gap-1 shrink-0">
                  {!isActive && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setActiveSession(deviceSession.session.token)
                      }
                      disabled={isSwitching || isRevoking}
                      aria-label={localization.auth.switchAccount}
                    >
                      {isSwitching ? <Spinner /> : <ArrowLeftRight />}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => revokeSession(deviceSession.session.token)}
                    disabled={isSwitching || isRevoking}
                    aria-label={localization.auth.signOut}
                  >
                    {isRevoking ? <Spinner /> : <LogOut />}
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="h-15 flex items-center rounded-xl border p-3">
            <UserView isPending {...config} />
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 md:px-6">
        <Button variant="secondary" asChild disabled={isPending}>
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className={cn(isPending && "opacity-50 pointer-events-none")}
          >
            <PlusCircle />

            {localization.auth.addAccount}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
