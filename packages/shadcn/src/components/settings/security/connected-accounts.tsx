"use client"

import { providerIcons, useAuth } from "@better-auth-ui/react"
import { getProviderName } from "@better-auth-ui/react/core"
import { Link, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useLinkSocial } from "@/hooks/settings/use-link-social"
import { useListAccounts } from "@/hooks/settings/use-list-accounts"
import { useUnlinkAccount } from "@/hooks/settings/use-unlink-account"
import { cn } from "@/lib/utils"

export type ConnectedAccountsProps = {
  className?: string
}

/**
 * Render a card UI for viewing and managing linked social accounts.
 *
 * Displays currently linked social accounts (excluding credentials) with unlink controls,
 * and lists available social providers with link controls. Actions are disabled while a link or unlink is in progress.
 *
 * @returns The connected accounts card as a React element
 */
export function ConnectedAccounts({ className }: ConnectedAccountsProps) {
  const { localization, socialProviders } = useAuth()
  const { data: accounts, isPending } = useListAccounts()
  const { linkSocial, linkingProvider } = useLinkSocial()
  const { unlinkAccount, unlinkingProvider } = useUnlinkAccount()

  return (
    <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
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
              .map((account) => {
                const ProviderIcon = providerIcons[account.providerId]
                const providerName = getProviderName(account.providerId)
                const isCurrentlyUnlinking =
                  unlinkingProvider === account.providerId

                return (
                  <div
                    key={account.id}
                    className="flex items-center rounded-lg border p-3 justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                        {ProviderIcon && <ProviderIcon className="size-5" />}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {providerName}
                        </span>

                        {account.accountId && (
                          <span className="text-xs text-muted-foreground">
                            {account.accountId}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => unlinkAccount(account.providerId)}
                      disabled={
                        isCurrentlyUnlinking ||
                        !!unlinkingProvider ||
                        !!linkingProvider
                      }
                      aria-label={localization.settings.unlinkProvider.replace(
                        "{{provider}}",
                        providerName
                      )}
                    >
                      {isCurrentlyUnlinking ? (
                        <Spinner className="size-4" />
                      ) : (
                        <X className="size-4" />
                      )}
                    </Button>
                  </div>
                )
              })}

            {socialProviders?.map((provider) => {
              const ProviderIcon = providerIcons[provider]
              const providerName = getProviderName(provider)
              const isCurrentlyLinking = linkingProvider === provider

              return (
                <div
                  key={provider}
                  className="flex items-center rounded-lg border border-dashed p-3 justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      {ProviderIcon && (
                        <ProviderIcon className="size-5 opacity-50" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">
                        {providerName}
                      </span>

                      <span className="text-xs text-muted-foreground/70">
                        {localization.settings.connectProvider.replace(
                          "{{provider}}",
                          providerName
                        )}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => linkSocial(provider)}
                    disabled={
                      isCurrentlyLinking ||
                      !!unlinkingProvider ||
                      !!linkingProvider
                    }
                    aria-label={localization.settings.connectProvider.replace(
                      "{{provider}}",
                      providerName
                    )}
                  >
                    {isCurrentlyLinking ? (
                      <Spinner className="size-4" />
                    ) : (
                      <Link className="size-4" />
                    )}
                  </Button>
                </div>
              )
            })}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function AccountRowSkeleton() {
  return (
    <div className="flex items-center rounded-lg border p-3 justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  )
}
