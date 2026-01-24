import { getProviderName } from "@better-auth-ui/core"
import {
  providerIcons,
  useAuth,
  useLinkSocial,
  useListAccounts,
  useUnlinkAccount
} from "@better-auth-ui/react"
import { Link as LinkIcon, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"

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

  const { data: accounts, isPending } = useListAccounts()
  const { linkSocial, linkingProvider } = useLinkSocial()
  const { unlinkAccount, unlinkingProvider } = useUnlinkAccount()

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
              .map((account) => {
                const ProviderIcon = providerIcons[account.providerId]
                const providerName = getProviderName(account.providerId)
                const isCurrentlyUnlinking =
                  unlinkingProvider === account.providerId

                return (
                  <Card
                    key={account.id}
                    className="flex-row items-center border p-3 shadow-none"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
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

                    <Button
                      className="ml-auto"
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      onPress={() => unlinkAccount(account.providerId)}
                      isPending={!!unlinkingProvider || !!linkingProvider}
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
                  </Card>
                )
              })}

            {socialProviders?.map((provider) => {
              const ProviderIcon = providerIcons[provider]
              const providerName = getProviderName(provider)
              const isCurrentlyLinking = linkingProvider === provider

              return (
                <Card
                  key={provider}
                  className="flex-row items-center border border-dashed p-3 shadow-none"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-default">
                    {ProviderIcon && (
                      <ProviderIcon className="size-5 opacity-50" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{providerName}</span>

                    <span className="text-xs text-muted">
                      {localization.settings.connectProvider.replace(
                        "{{provider}}",
                        providerName
                      )}
                    </span>
                  </div>

                  <Button
                    className="ml-auto"
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    onPress={() => linkSocial(provider)}
                    isPending={!!linkingProvider || !!unlinkingProvider}
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
                </Card>
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
