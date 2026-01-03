import { getProviderName } from "@better-auth-ui/core"
import {
  type AnyAuthConfig,
  providerIcons,
  useLinkSocial,
  useListAccounts,
  useSession,
  useUnlinkAccount
} from "@better-auth-ui/react"
import { Link as LinkIcon, Xmark } from "@gravity-ui/icons"
import { Button, Card, cn, Skeleton, Spinner } from "@heroui/react"

import { useAuth } from "../../../hooks/use-auth"

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

  // Get list of connected accounts (excluding credential provider)
  const connectedAccounts =
    accounts?.filter((account) => account.providerId !== "credential") || []

  const isLoading = !sessionData || isLoadingAccounts

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.connectedAccounts}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-3">
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
                  className="flex items-center rounded-3xl border-2 border-default p-3 justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-default">
                      {ProviderIcon && <ProviderIcon className="size-5" />}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {providerName}
                      </span>

                      {account.accountId && (
                        <span className="text-xs text-muted">
                          {account.accountId}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    onPress={() => unlinkAccount(account.providerId)}
                    isPending={isCurrentlyUnlinking}
                    isDisabled={!!unlinkingProvider || !!linkingProvider}
                    aria-label={localization.settings.unlinkProvider.replace(
                      "{{provider}}",
                      providerName
                    )}
                  >
                    {isCurrentlyUnlinking ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      <Xmark />
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
                  className="flex items-center rounded-3xl border-2 border-dashed border-default p-3 justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-default">
                      {ProviderIcon && (
                        <ProviderIcon className="size-5 opacity-50" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {providerName}
                      </span>

                      <span className="text-xs text-muted">
                        {localization.settings.connectProvider.replace(
                          "{{provider}}",
                          providerName
                        )}
                      </span>
                    </div>
                  </div>

                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    onPress={() => linkSocial(provider)}
                    isPending={isCurrentlyLinking}
                    isDisabled={!!unlinkingProvider || !!linkingProvider}
                    aria-label={localization.settings.connectProvider.replace(
                      "{{provider}}",
                      providerName
                    )}
                  >
                    {isCurrentlyLinking ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      <LinkIcon />
                    )}
                  </Button>
                </div>
              )
            })}
          </>
        )}
      </Card.Content>
    </Card>
  )
}

function AccountRowSkeleton() {
  return (
    <div className="flex items-center rounded-3xl border-2 border-default p-3 justify-between">
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
