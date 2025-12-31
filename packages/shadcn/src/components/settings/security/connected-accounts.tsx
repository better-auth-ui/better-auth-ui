"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import { providerIcons } from "@better-auth-ui/react"
import { getProviderName } from "@better-auth-ui/react/core"
import { Link, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import { useLinkSocial } from "@/hooks/settings/use-link-social"
import { useListAccounts } from "@/hooks/settings/use-list-accounts"
import { useUnlinkAccount } from "@/hooks/settings/use-unlink-account"
import { cn } from "@/lib/utils"

export type ConnectedAccountsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Display and manage connected social accounts.
 *
 * Shows all linked social accounts with the ability to unlink them,
 * followed by available providers that can be linked.
 *
 * @returns A JSX element containing the connected accounts card
 */
export function ConnectedAccounts({
  className,
  ...config
}: ConnectedAccountsProps) {
  const context = useAuth(config)
  const { localization, socialProviders } = context

  const { data: sessionData } = useSession(context)
  const { data: accounts, isPending: isLoadingAccounts } =
    useListAccounts(context)
  const { linkSocial, linkingProvider } = useLinkSocial(context)
  const { unlinkAccount, unlinkingProvider } = useUnlinkAccount(context)

  // Get list of providers that are not yet connected
  const availableProviders =
    socialProviders?.filter(
      (provider) =>
        !accounts?.some((account) => account.providerId === provider)
    ) || []

  // Get list of connected accounts
  const connectedAccounts = accounts || []

  const isLoading = !sessionData || isLoadingAccounts

  return (
    <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
      <CardHeader className="px-4 md:px-6 gap-0">
        <CardTitle className="text-xl">
          {localization.settings.connectedAccounts}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-6 grid gap-3">
        {/* Connected Accounts */}
        {isLoading ? (
          <AccountRowSkeleton />
        ) : (
          <>
            {connectedAccounts.map((account) => {
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

            {/* Available Providers to Connect */}
            {availableProviders.map((provider) => {
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
