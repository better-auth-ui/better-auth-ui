import { listAccountsOptions, useAuth, useSession } from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { For, Show } from "solid-js"
import { shouldLoadLinkedAccounts } from "@/components/auth/settings/shared/helpers"
import type {
  LinkedAccount,
  LinkedProvider
} from "@/components/auth/settings/shared/types"
import { Card, CardContent } from "@/components/ui/card"
import { ItemSeparator } from "@/components/ui/item"
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
    })
  }))
  const socialProviders = () => auth.socialProviders ?? []
  const accountRows = () => {
    const linked = (linkedAccounts.data ?? [])
      .filter(
        (account: { providerId?: string }) =>
          account.providerId !== "credential"
      )
      .map((account: LinkedAccount) => ({
        account,
        key: account.id,
        provider: account.providerId as LinkedProvider
      }))

    return [
      ...linked,
      ...socialProviders().map((provider) => ({
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

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            fallback={
              <For each={socialProviders()}>
                {(_, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <LinkedAccountRowSkeleton />
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
                    <ItemSeparator />
                  </Show>
                  <LinkedAccountRow
                    account={row.account}
                    provider={row.provider}
                    userId={userId()}
                  />
                </>
              )}
            </For>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
