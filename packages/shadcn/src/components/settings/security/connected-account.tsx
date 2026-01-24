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
import { LinkIcon, Plug, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

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
    account?.accountId
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
    <Item
      className={cn("p-3 gap-3", !account && "border-dashed")}
      variant="outline"
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        {ProviderIcon ? (
          <ProviderIcon className={cn("size-5", !account && "opacity-50")} />
        ) : (
          <Plug className={cn("size-5", !account && "opacity-50")} />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium">{providerName}</span>

        {account && isLoadingInfo ? (
          <Skeleton className="my-0.5 h-3 w-24" />
        ) : (
          <span className="text-xs text-muted-foreground">
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
          variant="ghost"
          size="icon"
          onClick={() => unlinkAccount(account.providerId)}
          disabled={isUnlinking}
          aria-label={localization.settings.unlinkProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          {isUnlinking ? (
            <Spinner className="size-4" />
          ) : (
            <X className="size-4" />
          )}
        </Button>
      ) : (
        <Button
          className="ml-auto"
          variant="outline"
          size="sm"
          onClick={() => linkSocial(provider)}
          disabled={isLinking}
          aria-label={localization.settings.connectProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          {isLinking ? <Spinner /> : <LinkIcon className="size-3" />}

          {localization.settings.connect}
        </Button>
      )}
    </Item>
  )
}
