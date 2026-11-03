"use client"
import {
  getAuthCallbackURL,
  type AuthSocialProvider,
  getAuthErrorMessage,
  getProviderId,
  getProviderName,
  isReauthenticationRequiredError
} from "@better-auth-ui/core"
import {
  renderProviderIcon,
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount
} from "@better-auth-ui/react"
import type { Account } from "better-auth"
import { Link2, Link2Off, Plug } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { cn } from "cn"
import { ReauthenticationAction } from "../../reauthentication"
export type LinkedAccountProps = {
  account?: Account
  canUnlink?: boolean
  provider: AuthSocialProvider | string
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
export function LinkedAccount({
  account,
  canUnlink = true,
  provider
}: LinkedAccountProps) {
  const { authClient, baseURL, localization } = useAuth()
  const { data: accountInfo, isPending: isLoadingInfo } = useAccountInfo(
    authClient,
    { query: { accountId: account?.id ?? "" } }
  )
  const { mutate: linkSocial, isPending: isLinking } = useLinkSocial(authClient)
  const unlinkAccount = useUnlinkAccount(authClient, {
    meta: { errorPresentation: "inline" },
    onError: (error) => {
      if (!isReauthenticationRequiredError(error)) {
        const message = getAuthErrorMessage(error, localization)
        if (message) {
          console.error("[Better Auth UI]", error)
          toast.error(message)
        }
      }
    },
    onSuccess: () => toast.success(localization.settings.accountUnlinked)
  })
  const providerId = getProviderId(provider)
  const providerIcon = renderProviderIcon(provider)
  const providerName = getProviderName(provider)
  const accountData = accountInfo?.data as
    | {
        login?: string
        username?: string
      }
    | undefined
  const displayName =
    accountData?.login ||
    accountData?.username ||
    accountInfo?.user?.email ||
    accountInfo?.user?.name ||
    account?.accountId
  const needsReauthentication = isReauthenticationRequiredError(
    unlinkAccount.error
  )
  return (
    <>
      <Item>
        <ItemMedia variant="icon" className={cn(!account && "opacity-50")}>
          {providerIcon ? providerIcon : <Plug />}
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
              onPress={() => unlinkAccount.mutate({ accountId: account.id })}
              isDisabled={unlinkAccount.isPending || !canUnlink}
              aria-description={
                canUnlink
                  ? undefined
                  : localization.settings.lastAccountUnlinkingDisabled
              }
              aria-label={localization.settings.unlinkProvider.replace(
                "{{provider}}",
                providerName
              )}
            >
              {unlinkAccount.isPending ? <Spinner /> : <Link2Off />}
              {localization.settings.unlinkProvider
                .replace("{{provider}}", "")
                .trim()}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onPress={() =>
                linkSocial({
                  provider: providerId,
                  callbackURL: getAuthCallbackURL(
                    baseURL,
                    window.location.pathname
                  )
                })
              }
              isDisabled={isLinking}
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
      {account && (
        <Dialog
          isOpen={needsReauthentication}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) unlinkAccount.reset()
          }}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">
              {localization.settings.reauthenticationTitle}
            </DialogTitle>
          </DialogHeader>
          <ReauthenticationAction showTitle={false} />
        </Dialog>
      )}
    </>
  )
}
