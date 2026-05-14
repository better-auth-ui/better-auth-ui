import { getProviderName } from "@better-auth-ui/core"
import {
  type AccountInfoParams,
  accountInfoOptions,
  linkSocialOptions,
  unlinkAccountOptions,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import { Link2, Link2Off, Plug } from "lucide-solid"
import { Show } from "solid-js"
import { toast } from "solid-sonner"
import type {
  AccountInfoResponse,
  LinkedAccount,
  LinkedProvider
} from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function LinkedAccountRow(props: {
  account?: LinkedAccount
  provider: LinkedProvider
  userId?: string
}) {
  const auth = useAuth()
  const providerName = () => getProviderName(props.provider)
  const accountInfo = createQuery(() => ({
    ...accountInfoOptions(auth.authClient, props.userId, {
      query: { accountId: props.account?.accountId }
    } as AccountInfoParams<typeof auth.authClient>),
    enabled: Boolean(props.userId && props.account?.accountId)
  }))
  const linkSocial = createMutation(() => ({
    ...linkSocialOptions(auth.authClient)
  }))
  const unlinkAccount = createMutation(() => ({
    ...unlinkAccountOptions(auth.authClient),
    onSuccess: () => toast.success(auth.localization.settings.accountUnlinked)
  }))
  const accountInfoData = () =>
    accountInfo.data as AccountInfoResponse | undefined
  const displayName = () =>
    accountInfoData()?.data?.login ||
    accountInfoData()?.data?.username ||
    accountInfoData()?.user?.email ||
    accountInfoData()?.user?.name ||
    props.account?.accountId
  const linkProviderLabel = () =>
    auth.localization.settings.linkProvider.replace(
      "{{provider}}",
      providerName()
    )
  const unlinkProviderLabel = () =>
    auth.localization.settings.unlinkProvider.replace(
      "{{provider}}",
      providerName()
    )
  const linkProvider = () => {
    linkSocial.mutate({
      callbackURL: `${auth.baseURL}${window.location.pathname}`,
      provider: props.provider
    } as Parameters<typeof linkSocial.mutate>[0])
  }
  const unlinkProvider = (account: LinkedAccount) => {
    unlinkAccount.mutate({
      providerId: account.providerId
    } as Parameters<typeof unlinkAccount.mutate>[0])
  }

  return (
    <div class="flex items-center justify-between gap-3 p-4 text-sm">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Plug class={cn("size-4.5", !props.account && "opacity-50")} />
        </div>
        <div class="flex min-w-0 flex-col">
          <span class="font-medium leading-tight">{providerName()}</span>
          <Show
            fallback={
              <span class="truncate text-muted-foreground text-xs">
                {props.account ? displayName() : linkProviderLabel()}
              </span>
            }
            when={props.account && accountInfo.isPending}
          >
            <Skeleton class="my-0.5 h-3 w-24" />
          </Show>
        </div>
      </div>

      <Show
        fallback={
          <Button
            aria-label={linkProviderLabel()}
            class="ml-auto shrink-0"
            disabled={linkSocial.isPending}
            onClick={linkProvider}
            size="sm"
            type="button"
            variant="outline"
          >
            <Link2 />
            {auth.localization.settings.link}
          </Button>
        }
        when={props.account}
      >
        {(account) => (
          <Button
            aria-label={unlinkProviderLabel()}
            class="ml-auto shrink-0"
            disabled={unlinkAccount.isPending}
            onClick={() => unlinkProvider(account())}
            size="sm"
            type="button"
            variant="outline"
          >
            <Link2Off />
            {auth.localization.settings.unlinkProvider
              .replace("{{provider}}", "")
              .trim()}
          </Button>
        )}
      </Show>
    </div>
  )
}

export function LinkedAccountRowSkeleton() {
  return (
    <div class="flex items-center gap-3 p-4">
      <Skeleton class="size-10 rounded-md" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}
