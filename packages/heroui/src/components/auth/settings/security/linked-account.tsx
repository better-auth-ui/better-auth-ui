import { getProviderName } from "@better-auth-ui/core"
import {
  providerIcons,
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount
} from "@better-auth-ui/react"
import { Link, LinkSlash, PlugConnection } from "@gravity-ui/icons"
import { Button, cn, Skeleton, Spinner, toast } from "@heroui/react"
import type { Account, SocialProvider } from "better-auth"

export type LinkedAccountProps = {
  account?: Account
  provider: SocialProvider
}

/**
 * Render a single linked social account row with provider info and link/unlink control.
 *
 * Fetches additional account information from the provider using the accountInfo API
 * and displays the provider name, account details, and a link/unlink button.
 *
 * @param account - The account object containing id, accountId, and providerId
 * @param provider - The provider id
 * @returns A JSX element containing the linked account row
 */
export function LinkedAccount({ account, provider }: LinkedAccountProps) {
  const { authClient, baseURL, localization } = useAuth()

  const { data: accountInfo, isPending: isLoadingInfo } = useAccountInfo(
    authClient,
    { query: { accountId: account?.id ?? "" } }
  )

  const { mutate: linkSocial, isPending: isLinking } = useLinkSocial(authClient)

  const { mutate: unlinkAccount, isPending: isUnlinking } = useUnlinkAccount(
    authClient,
    {
      onSuccess: () => toast.success(localization.settings.accountUnlinked)
    }
  )

  const ProviderIcon = providerIcons[provider]
  const providerName = getProviderName(provider)
  const accountData = accountInfo?.data as
    | { login?: string; username?: string }
    | undefined

  const displayName =
    accountData?.login ||
    accountData?.username ||
    accountInfo?.user?.email ||
    accountInfo?.user?.name ||
    account?.accountId

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary"
        )}
      >
        {ProviderIcon ? (
          <ProviderIcon className="size-4.5" />
        ) : (
          <PlugConnection className="size-4.5" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium leading-tight">
          {providerName}
        </span>

        {account && isLoadingInfo ? (
          <Skeleton className="h-3 w-24 my-0.5 rounded-lg" />
        ) : (
          <span className="text-xs text-muted truncate">
            {account
              ? displayName
              : localization.settings.linkProvider.replace(
                  "{{provider}}",
                  providerName
                )}
          </span>
        )}
      </div>

      {account ? (
        <Button
          className="ml-auto shrink-0"
          variant="outline"
          size="sm"
          onPress={() => unlinkAccount({ accountId: account.id })}
          isPending={isUnlinking}
          aria-label={localization.settings.unlinkProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          {isUnlinking ? <Spinner color="current" size="sm" /> : <LinkSlash />}
          {localization.settings.unlinkProvider
            .replace("{{provider}}", "")
            .trim()}
        </Button>
      ) : (
        <Button
          className="ml-auto shrink-0"
          variant="outline"
          size="sm"
          onPress={() =>
            linkSocial({
              provider,
              callbackURL: `${baseURL}${window.location.pathname}`
            })
          }
          isPending={isLinking}
          aria-label={localization.settings.linkProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          {isLinking ? <Spinner color="current" size="sm" /> : <Link />}
          {localization.settings.link}
        </Button>
      )}
    </div>
  )
}
