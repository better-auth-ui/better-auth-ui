"use client"

import { useAuth, useListSessions, useSession } from "@better-auth-ui/react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ActiveSession } from "./active-session"

export type ActiveSessionsProps = {
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
export function ActiveSessions({ className }: ActiveSessionsProps) {
  const { authClient, localization } = useAuth()
  const { data: session } = useSession(authClient)

  const { data: sessions, isPending } = useListSessions(authClient)

  const activeSessions = [...(sessions ?? [])].sort((activeSession) =>
    activeSession.id === session?.session.id ? -1 : 1
  )

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.activeSessions}
      </h2>

      <Card className={cn("p-0", className)}>
        <CardContent className="p-0">
          {isPending ? (
            <SessionRowSkeleton />
          ) : (
            activeSessions?.map((activeSession, index) => (
              <div key={activeSession.id}>
                {index > 0 && <Separator />}

                <ActiveSession activeSession={activeSession} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SessionRowSkeleton() {
  return (
    <Card className="bg-transparent border-0 ring-0 shadow-none">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
