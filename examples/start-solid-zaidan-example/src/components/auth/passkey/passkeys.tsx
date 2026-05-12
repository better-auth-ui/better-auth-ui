import { passkeyLocalization } from "@better-auth-ui/core/plugins"
import {
  listPasskeysOptions,
  type PasskeyAuthClient,
  useAuth
} from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { createSignal, For, Show } from "solid-js"
import { AddPasskeyDialog } from "@/components/auth/passkey/add-passkey-dialog"
import { Passkey } from "@/components/auth/passkey/passkey"
import { PasskeySkeleton } from "@/components/auth/passkey/passkey-skeleton"
import { PasskeysEmpty } from "@/components/auth/passkey/passkeys-empty"
import { shouldLoadDeviceSessions } from "@/components/auth/settings/shared/helpers"
import type {
  ListedPasskey,
  SettingsSession
} from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ItemSeparator } from "@/components/ui/item"

export function PasskeysSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const [isAddDialogOpen, setIsAddDialogOpen] = createSignal(false)
  const passkeys = createQuery(() => ({
    ...listPasskeysOptions(auth.authClient as PasskeyAuthClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const items = () => passkeys.data ?? []

  return (
    <div class="flex flex-col gap-3">
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">
          {passkeyLocalization.passkeys}
        </h2>
        <Dialog open={isAddDialogOpen()} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger
            as={Button}
            class="shrink-0"
            disabled={passkeys.isPending}
            size="sm"
          >
            {passkeyLocalization.addPasskey}
          </DialogTrigger>
          <AddPasskeyDialog
            onOpenChange={setIsAddDialogOpen}
            onPasskeyAdded={() => passkeys.refetch()}
          />
        </Dialog>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show when={!passkeys.isPending} fallback={<PasskeySkeleton />}>
            <Show
              when={items().length > 0}
              fallback={
                <PasskeysEmpty onAddPress={() => setIsAddDialogOpen(true)} />
              }
            >
              <For each={items()}>
                {(passkey, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <Passkey passkey={passkey as ListedPasskey} />
                  </>
                )}
              </For>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
