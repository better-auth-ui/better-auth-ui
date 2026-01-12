"use client"

import { useAuth } from "@better-auth-ui/react"
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
import { useSession } from "@/hooks/auth/use-session"
import { useListDeviceSessions } from "@/hooks/settings/use-list-device-sessions"
import { useRevokeMultiSession } from "@/hooks/settings/use-revoke-multi-session"
import { useSetActiveSession } from "@/hooks/settings/use-set-active-session"
import { cn } from "@/lib/utils"

export type AccountsProps = {
  className?: string
}

/**
 * Render a card that lists signed-in device sessions and provides controls to switch the active session or revoke (sign out) individual sessions.
 *
 * Shows the current session first, followed by other device sessions; displays a pending placeholder when session data is loading. Switch and revoke controls are disabled while their respective operations are in progress.
 *
 * @param className - Optional additional CSS class names to apply to the root card
 * @returns The accounts card JSX element
 */
export function Accounts({ className }: AccountsProps) {
  const { basePaths, localization, viewPaths, Link } = useAuth()
  const { data: sessionData } = useSession()
  const { data: deviceSessions, isPending } = useListDeviceSessions()
  const { settingActiveSession, setActiveSession } = useSetActiveSession()
  const { revokingSession, revokeSession } = useRevokeMultiSession()

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
                <UserView user={deviceSession.user} />

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
            <UserView isPending />
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
