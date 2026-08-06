"use client"

import { getProviderName } from "@better-auth-ui/core"
import {
  providerIcons,
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount
} from "@better-auth-ui/react"
import type { Account, SocialProvider } from "better-auth"
import { Link2, Link2Off, Plug } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

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
    <Item>
      <ItemMedia variant="icon">
        {ProviderIcon ? (
          <ProviderIcon className={cn(!account && "opacity-50")} />
        ) : (
          <Plug className={cn(!account && "opacity-50")} />
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{providerName}</ItemTitle>
        {account && isLoadingInfo ? (
          <Skeleton className="my-0.5 h-3 w-24" />
        ) : (
          <ItemDescription>
            {account
              ? displayName
              : localization.settings.linkProvider.replace(
                  "{{provider}}",
                  providerName
                )}
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        {account ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => unlinkAccount({ accountId: account.id })}
            disabled={isUnlinking}
            aria-label={localization.settings.unlinkProvider.replace(
              "{{provider}}",
              providerName
            )}
          >
            {isUnlinking ? <Spinner /> : <Link2Off />}
            {localization.settings.unlinkProvider
              .replace("{{provider}}", "")
              .trim()}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              linkSocial({
                provider,
                callbackURL: `${baseURL}${window.location.pathname}`
              })
            }
            disabled={isLinking}
            aria-label={localization.settings.linkProvider.replace(
              "{{provider}}",
              providerName
            )}
          >
            {isLinking ? <Spinner /> : <Link2 />}
            {localization.settings.link}
          </Button>
        )}
      </ItemActions>
    </Item>
  )
}
