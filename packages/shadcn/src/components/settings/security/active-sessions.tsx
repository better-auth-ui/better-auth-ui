"use client"

import { useAuth, useListSessions, useSession } from "@better-auth-ui/react"
import { useEffect } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item } from "@/components/ui/item"
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
  const { localization } = useAuth()
  const { data: sessionData } = useSession()
  const { data: sessions, isPending, error } = useListSessions()

  useEffect(() => {
    if (error) toast.error(error.error?.message || error.message)
  }, [error])

  return (
    <Card className={cn("w-full py-4 md:py-6 gap-4", className)}>
      <CardHeader className="px-4 md:px-6 gap-0">
        <CardTitle className="text-xl">
          {localization.settings.activeSessions}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6 grid gap-3">
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
      </CardContent>
    </Card>
  )
}

function SessionRowSkeleton() {
  return (
    <Item className="p-3 gap-3" variant="outline">
      <Skeleton className="size-10 rounded-md" />

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Item>
  )
}
