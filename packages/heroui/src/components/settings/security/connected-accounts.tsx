import { useAuth, useListAccounts } from "@better-auth-ui/react"
import { Card, type CardProps, cn, Skeleton, toast } from "@heroui/react"
import { useEffect } from "react"
import { ConnectedAccount } from "./connected-account"

export type ConnectedAccountsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card showing linked social accounts and available social providers to connect.
 *
 * Linked accounts (excluding the "credential" provider) are shown with an unlink control;
 * available providers are shown with a connect control. Button states and labels reflect
 * ongoing link/unlink activity and use localization for provider-specific text.
 *
 * @returns A JSX element containing the connected accounts card
 */
export function ConnectedAccounts({
  className,
  ...props
}: ConnectedAccountsProps & CardProps) {
  const { localization, socialProviders } = useAuth()
  const { data: accounts, isPending, error } = useListAccounts()

  useEffect(() => {
    if (error)
      toast.danger(error.error?.message || error.message, { timeout: 3000 })
  }, [error])

  return (
    <Card className={cn("p-4 md:p-6 gap-4", className)} {...props}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.connectedAccounts}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
        {isPending ? (
          <AccountRowSkeleton />
        ) : (
          <>
            {accounts
              ?.filter((account) => account.providerId !== "credential")
              .map((account) => (
                <ConnectedAccount
                  key={account.id}
                  account={account}
                  provider={account.providerId}
                />
              ))}

            {socialProviders?.map((provider) => {
              return <ConnectedAccount key={provider} provider={provider} />
            })}
          </>
        )}
      </Card.Content>
    </Card>
  )
}

function AccountRowSkeleton() {
  return (
    <div className="flex items-center rounded-3xl border p-3 justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
