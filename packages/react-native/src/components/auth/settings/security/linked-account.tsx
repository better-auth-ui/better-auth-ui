import { getProviderName } from "@better-auth-ui/core"
import {
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount
} from "@better-auth-ui/react"
import type { Account } from "better-auth"
import type { SocialProvider } from "better-auth/social-providers"
import { Text, View } from "react-native"
import { cn } from "../../../../lib/cn"
import { providerIcons } from "../../../../lib/provider-icons"
import { useThemeColors } from "../../../../lib/theme-colors"
import { Button } from "../../../../primitives/button"
import { Skeleton } from "../../../../primitives/skeleton"
import { toast } from "../../../../primitives/toast"
import {
  LinkIcon as Link,
  LinkSlash,
  PlugConnection
} from "../../../../primitives/ui-icons"

export type LinkedAccountProps = {
  account?: Account
  provider: SocialProvider
}

/**
 * Render a single linked social account row with provider info and link/unlink control.
 *
 * Fetches additional account information from the provider using the accountInfo API
 * and displays the provider name, account details, and a link/unlink button. Mirrors the
 * heroui `LinkedAccount`, adapted for React Native: the `callbackURL` for linking a new
 * provider is built from `baseURL`/`redirectTo` (no `window.location`) matching the
 * convention already used by `ProviderButton`.
 *
 * @param account - The account object containing id, accountId, and providerId
 * @param provider - The provider id
 * @returns A JSX element containing the linked account row
 */
export function LinkedAccount({ account, provider }: LinkedAccountProps) {
  const { authClient, baseURL, localization, redirectTo } = useAuth()
  const colors = useThemeColors()

  const { data: accountInfo, isPending: isLoadingInfo } = useAccountInfo(
    authClient,
    { query: { accountId: account?.accountId } }
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

  const displayName =
    accountInfo?.data?.login ||
    accountInfo?.data?.username ||
    accountInfo?.user?.email ||
    accountInfo?.user?.name ||
    account?.accountId

  return (
    <View className="flex-row items-center gap-3">
      <View
        className={cn(
          "size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary"
        )}
      >
        {ProviderIcon ? (
          <ProviderIcon width={18} height={18} color={colors.foreground} />
        ) : (
          <PlugConnection width={18} height={18} color={colors.foreground} />
        )}
      </View>

      <View className="flex-col min-w-0 shrink grow">
        <Text className="text-sm font-medium leading-tight text-foreground">
          {providerName}
        </Text>

        {account && isLoadingInfo ? (
          <Skeleton className="h-3 w-24 my-0.5 rounded-lg" />
        ) : (
          <Text className="text-xs text-muted" numberOfLines={1}>
            {account
              ? displayName
              : localization.settings.linkProvider.replace(
                  "{{provider}}",
                  providerName
                )}
          </Text>
        )}
      </View>

      {account ? (
        <Button
          className="ml-auto shrink-0"
          variant="outline"
          size="sm"
          onPress={() => unlinkAccount({ providerId: account.providerId })}
          isPending={isUnlinking}
          aria-label={localization.settings.unlinkProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          <LinkSlash width={16} height={16} color={colors.foreground} />
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
              callbackURL: `${baseURL}${redirectTo}`
            })
          }
          isPending={isLinking}
          aria-label={localization.settings.linkProvider.replace(
            "{{provider}}",
            providerName
          )}
        >
          <Link width={16} height={16} color={colors.foreground} />
          {localization.settings.link}
        </Button>
      )}
    </View>
  )
}
