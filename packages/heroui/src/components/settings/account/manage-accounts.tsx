import {
  useAuth,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"
import { CirclePlus } from "@gravity-ui/icons"
import { buttonVariants, Card, type CardProps, cn, toast } from "@heroui/react"
import { ManageAccount } from "./manage-account"

export type ManageAccountsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card that lists and manages all device sessions for the current user.
 *
 * Shows each session with user information and actions to switch to or revoke a session.
 * When device session data is loading, a pending placeholder row is displayed.
 *
 * @returns A JSX element containing the accounts management card
 */
export function ManageAccounts({
  className,
  ...props
}: ManageAccountsProps & CardProps) {
  const { basePaths, localization, viewPaths, Link } = useAuth()
  const { data: sessionData } = useSession()

  const { data: deviceSessions, isPending } = useListDeviceSessions({
    throwOnError: (error) => {
      if (error.error) toast.danger(error.error.message, { timeout: 3000 })
      return false
    }
  })

  return (
    <Card className={cn("p-4 md:p-6 gap-4", className)} {...props}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.manageAccounts}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
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
      </Card.Content>

      <Card.Footer>
        <Link
          href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          <CirclePlus />

          {localization.auth.addAccount}
        </Link>
      </Card.Footer>
    </Card>
  )
}
