import { getProviderName } from "@better-auth-ui/core"
import {
  providerIcons,
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount
} from "@better-auth-ui/react"
import { Link, PlugConnection, Xmark } from "@gravity-ui/icons"
import { Button, Card, cn, Skeleton, Spinner } from "@heroui/react"
import type { Account, SocialProvider } from "better-auth"

export type ConnectedAccountProps = {
  account?: Account
  provider: SocialProvider
}

/**
 * Render a single connected social account card with provider info and unlink control.
 *
 * Fetches additional account information from the provider using the accountInfo API
 * and displays the provider name, account details, and an unlink button.
 *
 * @param account - The account object containing id, accountId, and providerId
 * @param provider - The provider id
 * @returns A JSX element containing the connected account card
 */
export function ConnectedAccount({ account, provider }: ConnectedAccountProps) {
  const { localization } = useAuth()

  const { data: accountInfo, isPending: isLoadingInfo } = useAccountInfo(
    account?.accountId,
    { enabled: !!account }
  )

  const { linkSocial, isPending: isLinking } = useLinkSocial()
  const { unlinkAccount, isPending: isUnlinking } = useUnlinkAccount()

  const ProviderIcon = providerIcons[provider]
  const providerName = getProviderName(provider)

  const displayName =
    accountInfo?.data?.login ||
    accountInfo?.data?.username ||
    accountInfo?.user?.email ||
    accountInfo?.user?.name ||
    account?.accountId

  return (
    <Card
      className={cn(
        "flex-row items-center border p-3 shadow-none",
        !account && "border-dashed"
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
        {ProviderIcon ? (
          <ProviderIcon className={cn("size-5", !account && "opacity-50")} />
        ) : (
          <PlugConnection className={cn("size-5", !account && "opacity-50")} />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium">{providerName}</span>

        {account && isLoadingInfo ? (
          <Skeleton className="h-3 my-0.5 w-24 rounded-lg" />
        ) : (
          <span className="text-xs text-muted">
            {account
              ? displayName
              : localization.settings.connectProvider.replace(
                  "{{provider}}",
                  providerName
                )}
          </span>
        )}
      </div>

      {account ? (
        <Button
          className="ml-auto"
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => unlinkAccount(account.providerId)}
          isPending={isUnlinking}
          aria-label={localization.settings.unlinkProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          {isUnlinking ? <Spinner color="current" size="sm" /> : <Xmark />}
        </Button>
      ) : (
        <Button
          className="ml-auto"
          variant="secondary"
          size="sm"
          onPress={() => linkSocial(provider)}
          isPending={isLinking}
          aria-label={localization.settings.connectProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          {isLinking ? <Spinner color="current" size="sm" /> : <Link />}

          {localization.settings.connect}
        </Button>
      )}
    </Card>
  )
}
