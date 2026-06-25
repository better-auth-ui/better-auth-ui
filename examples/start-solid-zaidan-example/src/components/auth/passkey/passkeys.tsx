import {
  type PasskeyAuthClient,
  useAuth,
  useListPasskeys,
  useSession
} from "@better-auth-ui/solid"
import { createSignal, For, Show } from "solid-js"
import { AddPasskeyDialog } from "@/components/auth/passkey/add-passkey-dialog"
import { Passkey } from "@/components/auth/passkey/passkey"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import { PasskeySkeleton } from "@/components/auth/passkey/passkey-skeleton"
import { PasskeysEmpty } from "@/components/auth/passkey/passkeys-empty"
import { shouldLoadDeviceSessions } from "@/components/auth/settings/shared/helpers"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ItemSeparator } from "@/components/ui/item"
import { cn } from "@/lib/utils"

export type PasskeysSettingsProps = {
  class?: string
}

export function PasskeysSettings(props: PasskeysSettingsProps) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const [isAddDialogOpen, setIsAddDialogOpen] = createSignal(false)
  const passkeys = useListPasskeys(auth.authClient as PasskeyAuthClient, {
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  })
  const items = () => passkeys.data ?? []

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">{labels().passkeys}</h2>
        <Dialog open={isAddDialogOpen()} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger
            as={Button}
            class="shrink-0"
            disabled={passkeys.isPending}
            size="sm"
          >
            {labels().addPasskey}
          </DialogTrigger>
          <AddPasskeyDialog
            onOpenChange={setIsAddDialogOpen}
            onPasskeyAdded={() => passkeys.refetch()}
          />
        </Dialog>
      </div>

      <Card class="z-card-padding-none">
        <CardContent class="z-card-content-padding-none">
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
