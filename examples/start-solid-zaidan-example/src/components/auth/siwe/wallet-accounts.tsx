import type {
  SiweAuthClient,
  SiweWalletAccount,
  SiweWalletManager
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useLinkSiweWallet,
  useSetPrimarySiweWallet,
  useSiweWallets,
  useUnlinkSiweWallet
} from "@better-auth-ui/solid/plugins/siwe"
import { Wallet, X } from "lucide-solid"
import { createSignal, For, Match, Show, Switch } from "solid-js"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { siwePlugin } from "@/lib/auth/siwe-plugin"
import { cn } from "@/lib/utils"

const shortAddress = (address: string) =>
  address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address

/**
 * The card only renders when the plugin was given a wallet manager, so a
 * missing one means the plugin registry is wired wrong rather than a user
 * hitting an edge case.
 */
const requireWalletManager = (manager?: SiweWalletManager) => {
  if (!manager) throw new Error("SIWE wallet management is not configured.")
  return manager
}

function WalletRow(props: { wallet: SiweWalletAccount }) {
  const auth = useAuth<SiweAuthClient>()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const [removeOpen, setRemoveOpen] = createSignal(false)
  const setPrimary = useSetPrimarySiweWallet(auth.authClient, manager)
  const unlink = useUnlinkSiweWallet(auth.authClient, manager)

  return (
    <div class="flex flex-wrap items-center gap-3 rounded-lg p-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Wallet class="size-4" />
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <span
            class="truncate font-mono text-sm font-medium"
            title={props.wallet.address}
          >
            {shortAddress(props.wallet.address)}
          </span>
          <Show when={props.wallet.isPrimary}>
            <Badge variant="secondary">{plugin.localization.primary}</Badge>
          </Show>
        </div>
        <span class="text-xs text-muted-foreground">
          {plugin.localization.chain.replace(
            "{{chainId}}",
            String(props.wallet.chainId)
          )}
        </span>
      </div>

      <Show when={!props.wallet.isPrimary}>
        <Button
          disabled={setPrimary.isPending}
          onClick={() => setPrimary.mutate(props.wallet.id)}
          size="sm"
          type="button"
          variant="outline"
        >
          {plugin.localization.setPrimary}
        </Button>
      </Show>

      <Button
        aria-label={plugin.localization.removeWallet}
        onClick={() => setRemoveOpen(true)}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <X />
      </Button>

      <AlertDialog onOpenChange={setRemoveOpen} open={removeOpen()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Wallet />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {plugin.localization.removeWalletTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {plugin.localization.removeWalletWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <code class="break-all rounded-lg bg-muted p-3 text-xs">
            {props.wallet.address}
          </code>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlink.isPending}>
              {auth.localization.settings.cancel}
            </AlertDialogCancel>
            <Button
              disabled={unlink.isPending}
              onClick={() =>
                unlink.mutate(props.wallet.id, {
                  onSuccess: () => setRemoveOpen(false)
                })
              }
              type="button"
              variant="destructive"
            >
              <Show when={unlink.isPending}>
                <Spinner data-icon="inline-start" />
              </Show>
              {plugin.localization.removeWallet}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export type WalletAccountsProps = {
  class?: string
}

/** Security-settings card listing the Ethereum wallets linked to the account. */
export function WalletAccounts(props: WalletAccountsProps) {
  const auth = useAuth<SiweAuthClient>()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const wallets = useSiweWallets(auth.authClient, () => manager)
  const link = useLinkSiweWallet(
    auth.authClient,
    manager,
    () => plugin.connector
  )

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-semibold">{plugin.localization.wallets}</h2>
          <p class="text-xs text-muted-foreground">
            {plugin.localization.walletsDescription}
          </p>
        </div>
        <Button
          disabled={link.isPending}
          onClick={() => link.mutate()}
          size="sm"
          type="button"
        >
          <Show when={link.isPending}>
            <Spinner data-icon="inline-start" />
          </Show>
          {plugin.localization.connectWallet}
        </Button>
      </div>

      <Card class="p-0">
        <CardContent class="flex flex-col gap-2 p-0">
          <Switch>
            <Match when={wallets.isPending}>
              <div class="flex items-center gap-3 p-3">
                <Skeleton class="size-10 rounded-lg" />
                <div class="flex flex-col gap-1">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-3 w-20" />
                </div>
              </div>
            </Match>

            <Match when={wallets.data?.length}>
              <For each={wallets.data}>
                {(wallet) => <WalletRow wallet={wallet} />}
              </For>
            </Match>

            <Match when={!wallets.data?.length}>
              <div class="flex items-center gap-3 p-4 text-muted-foreground">
                <Wallet class="size-5" />
                <p class="text-sm">{plugin.localization.noWallets}</p>
              </div>
            </Match>
          </Switch>
        </CardContent>
      </Card>
    </div>
  )
}
