"use client"

import { useAuth, useListAccounts } from "@better-auth-ui/react"
import { Fragment } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { LinkedAccount } from "./linked-account"

export type LinkedAccountsProps = {
  className?: string
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
export function LinkedAccounts({ className }: LinkedAccountsProps) {
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
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.linkedAccounts}
      </h2>

      <Card className={cn("p-0", className)}>
        <CardContent className="p-0">
          <ItemGroup className="gap-0">
            {isPending
              ? socialProviders?.map((provider, index) => (
                  <Fragment key={provider}>
                    {index > 0 && <ItemSeparator />}
                    <AccountRowSkeleton />
                  </Fragment>
                ))
              : allRows.map((row, index) => (
                  <Fragment key={row.key}>
                    {index > 0 && <ItemSeparator />}
                    <LinkedAccount
                      account={row.account}
                      provider={row.provider}
                    />
                  </Fragment>
                ))}
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
  )
}

function AccountRowSkeleton() {
  return (
    <Item>
      <ItemMedia>
        <Skeleton className="size-10 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </ItemContent>
    </Item>
  )
}
