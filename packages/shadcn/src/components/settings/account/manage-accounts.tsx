"use client"

import {
  useAuth,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ManageAccount } from "./manage-account"

export type ManageAccountsProps = {
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
export function ManageAccounts({ className }: ManageAccountsProps) {
  const { basePaths, localization, viewPaths, Link } = useAuth()
  const { data: sessionData } = useSession()

  const { data: deviceSessions, isPending } = useListDeviceSessions({
    throwOnError: (error) => {
      if (error.error) toast.error(error.error.message)
      return false
    }
  })

  return (
    <Card className={cn("w-full py-4 md:py-6 gap-4", className)}>
      <CardHeader className="px-4 md:px-6 gap-0">
        <CardTitle className="text-xl">
          {localization.settings.manageAccounts}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6 grid gap-3">
        <ManageAccount
          isPending={isPending}
          deviceSession={!isPending ? sessionData : null}
        />

        {deviceSessions
          ?.filter(
            (deviceSession) =>
              deviceSession.session.id !== sessionData?.session.id
          )
          .map((deviceSession) => (
            <ManageAccount
              key={deviceSession.session.id}
              deviceSession={deviceSession}
            />
          ))}
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
