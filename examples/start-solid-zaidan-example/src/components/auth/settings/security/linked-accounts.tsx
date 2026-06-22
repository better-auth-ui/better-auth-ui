import { listAccountsOptions } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { For, Show } from "solid-js"
import { shouldLoadLinkedAccounts } from "@/components/auth/settings/shared/helpers"
import type {
  LinkedAccount,
  LinkedProvider
} from "@/components/auth/settings/shared/types"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { LinkedAccountRow, LinkedAccountRowSkeleton } from "./linked-account"

export type LinkedAccountsSettingsProps = {
  class?: string
}

export function LinkedAccountsSettings(
  props: LinkedAccountsSettingsProps = {}
) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const linkedAccounts = createQuery(() => ({
    ...listAccountsOptions(auth.authClient, userId()),
    enabled: shouldLoadLinkedAccounts({
      isSsr: import.meta.env.SSR,
      userId: userId()
    }),
    initialData: undefined
  }))
  const socialProviders = () => auth.socialProviders ?? []
  const linkedSocialAccounts = () =>
    ((linkedAccounts.data ?? []) as LinkedAccount[]).filter(
      (account) => account.providerId !== "credential"
    )
  const availableProviders = () => {
    if (auth.multipleAccountsPerProvider !== false) return socialProviders()

    const linkedProviderIds = new Set(
      linkedSocialAccounts().map((account) => account.providerId)
    )

    return socialProviders().filter(
      (provider) => !linkedProviderIds.has(provider)
    )
  }
  const accountRows = () => {
    const linked = linkedSocialAccounts().map((account: LinkedAccount) => ({
      account,
      key: account.id,
      provider: account.providerId as LinkedProvider
    }))

    return [
      ...linked,
      ...availableProviders().map((provider) => ({
        account: undefined,
        key: provider,
        provider: provider as LinkedProvider
      }))
    ]
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.linkedAccounts}
      </h2>

      <Card class="z-card-padding-none">
        <CardContent class="z-card-content-padding-none">
          <Show
            fallback={
              <For each={socialProviders()}>
                {(_, index) => (
                  <>
                    <Show when={index() > 0}>
                      <Separator />
                    </Show>
                    <div class="p-4">
                      <LinkedAccountRowSkeleton />
                    </div>
                  </>
                )}
              </For>
            }
            when={!linkedAccounts.isPending}
          >
            <For each={accountRows()}>
              {(row, index) => (
                <>
                  <Show when={index() > 0}>
                    <Separator />
                  </Show>
                  <div class="p-4">
                    <LinkedAccountRow
                      account={row.account}
                      provider={row.provider}
                      userId={userId()}
                    />
                  </div>
                </>
              )}
            </For>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
