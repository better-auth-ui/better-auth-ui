import { getProviderId } from "@better-auth-ui/core"
import { useAuth, useListAccounts } from "@better-auth-ui/react"
import { cn } from "../../../../lib/cn"
import { Card, type CardVariant } from "../../../../primitives/card"
import { Separator } from "../../../../primitives/separator"
import { Skeleton } from "../../../../primitives/skeleton"
import { Box, Txt } from "../../../../primitives/styled"
import { LinkedAccount } from "./linked-account"

export type LinkedAccountsProps = {
  className?: string
  variant?: CardVariant
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
export function LinkedAccounts({ className, variant }: LinkedAccountsProps) {
  const {
    authClient,
    allowUnlinkingAllAccounts,
    localization,
    multipleAccountsPerProvider,
    socialProviders
  } = useAuth()

  const { data: accounts, isPending } = useListAccounts(authClient)

  const linkedAccounts = accounts?.filter(
    (account) => account.providerId !== "credential"
  )

  const canUnlink =
    allowUnlinkingAllAccounts === true || (accounts?.length ?? 0) > 1

  const linkedProviderIds = new Set(linkedAccounts?.map((a) => a.providerId))

  const availableProviders =
    multipleAccountsPerProvider === false
      ? socialProviders?.filter(
          (provider) => !linkedProviderIds.has(getProviderId(provider))
        )
      : socialProviders

  const allRows = [
    ...(linkedAccounts?.map((account) => ({
      key: account.id,
      account,
      provider:
        socialProviders?.find(
          (provider) => getProviderId(provider) === account.providerId
        ) ?? account.providerId
    })) ?? []),
    ...(availableProviders?.map((provider) => ({
      key: getProviderId(provider),
      account: undefined,
      provider
    })) ?? [])
  ]

  return (
    <Box>
      <Txt className={cn("text-sm font-semibold mb-3 text-foreground")}>
        {localization.settings.linkedAccounts}
      </Txt>

      <Card className={cn(className)} variant={variant}>
        <Card.Content className="gap-0">
          {isPending
            ? socialProviders?.map((provider, index) => (
                <Box key={getProviderId(provider)}>
                  {index > 0 && <Separator className="my-4" />}
                  <AccountRowSkeleton />
                </Box>
              ))
            : allRows.map((row, index) => (
                <Box key={row.key}>
                  {index > 0 && <Separator className="my-4" />}

                  <LinkedAccount
                    account={row.account}
                    canUnlink={canUnlink}
                    provider={row.provider}
                  />
                </Box>
              ))}
        </Card.Content>
      </Card>
    </Box>
  )
}

function AccountRowSkeleton() {
  return (
    <Box className="flex-row items-center justify-between">
      <Box className="flex-row items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <Box className="flex-col gap-1">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </Box>
      </Box>
    </Box>
  )
}
