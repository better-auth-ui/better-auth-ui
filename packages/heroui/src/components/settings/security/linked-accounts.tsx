import { useAuth, useListAccounts } from "@better-auth-ui/react"
import { Card, type CardProps, cn, Skeleton } from "@heroui/react"
import { LinkedAccount } from "./linked-account"

export type LinkedAccountsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card showing linked social accounts and available social providers to link.
 *
 * Linked accounts (excluding the "credential" provider) are shown with an unlink control;
 * available providers are shown with a link control. Button states and labels reflect
 * ongoing link/unlink activity and use localization for provider-specific text.
 *
 * @returns A JSX element containing the linked accounts card
 */
export function LinkedAccounts({
  className,
  variant,
  ...props
}: LinkedAccountsProps & Omit<CardProps, "children">) {
  const { localization, socialProviders } = useAuth()

  const { data: accounts, isPending } = useListAccounts()

  const linkedAccounts = accounts?.filter(
    (account) => account.providerId !== "credential"
  )

  const linkedProviderIds = new Set(
    linkedAccounts?.map((account) => account.providerId)
  )

  const unlinkedProviders = socialProviders?.filter(
    (provider) => !linkedProviderIds.has(provider)
  )

  const allRows = [
    ...(linkedAccounts?.map((account) => ({
      key: account.id,
      account,
      provider: account.providerId
    })) ?? []),
    ...(unlinkedProviders?.map((provider) => ({
      key: provider,
      account: undefined,
      provider
    })) ?? [])
  ]

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.linkedAccounts}
      </h2>

      <Card className={cn(className)} variant={variant} {...props}>
        <Card.Content className="gap-0">
          {isPending
            ? socialProviders?.map((provider, index) => (
                <div key={provider}>
                  {index > 0 && (
                    <div className="border-b border-dashed -mx-4 md:-mx-6 my-4" />
                  )}
                  <AccountRowSkeleton />
                </div>
              ))
            : allRows.map((row, index) => (
                <div key={row.key}>
                  {index > 0 && (
                    <div className="border-b border-dashed -mx-4 md:-mx-6 my-4" />
                  )}

                  <LinkedAccount
                    account={row.account}
                    provider={row.provider}
                  />
                </div>
              ))}
        </Card.Content>
      </Card>
    </div>
  )
}

function AccountRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
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
