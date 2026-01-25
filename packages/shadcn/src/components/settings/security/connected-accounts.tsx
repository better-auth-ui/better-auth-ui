"use client"

import { useAuth, useListAccounts } from "@better-auth-ui/react"
import { useEffect } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ConnectedAccount } from "./connected-account"

export type ConnectedAccountsProps = {
  className?: string
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
export function ConnectedAccounts({ className }: ConnectedAccountsProps) {
  const { localization, socialProviders } = useAuth()
  const { data: accounts, isPending, error } = useListAccounts()

  useEffect(() => {
    if (error) toast.error(error.error?.message || error.message)
  }, [error])

  return (
    <Card className={cn("w-full py-4 md:py-6 gap-4", className)}>
      <CardHeader className="px-4 md:px-6 gap-0">
        <CardTitle className="text-xl">
          {localization.settings.connectedAccounts}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6 grid gap-3">
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
      </CardContent>
    </Card>
  )
}

function AccountRowSkeleton() {
  return (
    <Item className="p-3 gap-3" variant="outline">
      <Skeleton className="size-10 rounded-md" />

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Item>
  )
}
