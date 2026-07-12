import { useAuth, useListAccounts } from "@better-auth-ui/react"
import { Text, View } from "react-native"
import { cn } from "../../../../lib/cn"
import { Card, type CardVariant } from "../../../../primitives/card"
import { Separator } from "../../../../primitives/separator"
import { Skeleton } from "../../../../primitives/skeleton"
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
    localization,
    multipleAccountsPerProvider,
    socialProviders
  } = useAuth()

  const { data: accounts, isPending } = useListAccounts(authClient)

  const linkedAccounts = accounts?.filter(
    (account) => account.providerId !== "credential"
  )

  const linkedProviderIds = new Set(linkedAccounts?.map((a) => a.providerId))

  const availableProviders =
    multipleAccountsPerProvider === false
      ? socialProviders?.filter((p) => !linkedProviderIds.has(p))
      : socialProviders

  const allRows = [
    ...(linkedAccounts?.map((account) => ({
      key: account.id,
      account,
      provider: account.providerId
    })) ?? []),
    ...(availableProviders?.map((provider) => ({
      key: provider,
      account: undefined,
      provider
    })) ?? [])
  ]

  return (
    <View>
      <Text className={cn("text-sm font-semibold mb-3 text-foreground")}>
        {localization.settings.linkedAccounts}
      </Text>

      <Card className={cn(className)} variant={variant}>
        <Card.Content className="gap-0">
          {isPending
            ? socialProviders?.map((provider, index) => (
                <View key={provider}>
                  {index > 0 && <Separator className="my-4" />}
                  <AccountRowSkeleton />
                </View>
              ))
            : allRows.map((row, index) => (
                <View key={row.key}>
                  {index > 0 && <Separator className="my-4" />}

                  <LinkedAccount
                    account={row.account}
                    provider={row.provider}
                  />
                </View>
              ))}
        </Card.Content>
      </Card>
    </View>
  )
}

function AccountRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <View className="flex-col gap-1">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </View>
      </View>
    </View>
  )
}
