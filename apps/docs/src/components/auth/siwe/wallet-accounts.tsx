"use client"

import type {
  SiweAuthClient,
  SiweWalletAccount,
  SiweWalletManager
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useLinkSiweWallet,
  useSetPrimarySiweWallet,
  useSiweWallets,
  useUnlinkSiweWallet
} from "@better-auth-ui/react/plugins/siwe"
import { Wallet, X } from "lucide-react"
import { useState } from "react"

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

const requireWalletManager = (manager?: SiweWalletManager) => {
  if (!manager) throw new Error("SIWE wallet management is not configured.")
  return manager
}

function WalletRow({ wallet }: { wallet: SiweWalletAccount }) {
  const { authClient, localization } = useAuth<SiweAuthClient>()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const [removeOpen, setRemoveOpen] = useState(false)
  const setPrimary = useSetPrimarySiweWallet(authClient, manager)
  const unlink = useUnlinkSiweWallet(authClient, manager)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Wallet className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className="truncate font-mono text-sm font-medium"
            title={wallet.address}
          >
            {shortAddress(wallet.address)}
          </span>
          {wallet.isPrimary && (
            <Badge variant="secondary">{plugin.localization.primary}</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {plugin.localization.chain.replace(
            "{{chainId}}",
            String(wallet.chainId)
          )}
        </span>
      </div>
      {!wallet.isPrimary && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={setPrimary.isPending}
          onClick={() => setPrimary.mutate(wallet.id)}
        >
          {plugin.localization.setPrimary}
        </Button>
      )}
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label={plugin.localization.removeWallet}
        onClick={() => setRemoveOpen(true)}
      >
        <X />
      </Button>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
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
          <code className="break-all rounded-lg bg-muted p-3 text-xs">
            {wallet.address}
          </code>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlink.isPending}>
              {localization.settings.cancel}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={unlink.isPending}
              onClick={() =>
                unlink.mutate(wallet.id, {
                  onSuccess: () => setRemoveOpen(false)
                })
              }
            >
              {unlink.isPending && <Spinner />}
              {plugin.localization.removeWallet}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export type WalletAccountsProps = { className?: string }

export function WalletAccounts({ className }: WalletAccountsProps) {
  const { authClient } = useAuth<SiweAuthClient>()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const wallets = useSiweWallets(authClient, manager)
  const link = useLinkSiweWallet(authClient, manager, plugin.connector)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">
            {plugin.localization.wallets}
          </h2>
          <p className="text-xs text-muted-foreground">
            {plugin.localization.walletsDescription}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={link.isPending}
          onClick={() => link.mutate()}
        >
          {link.isPending && <Spinner />}
          {plugin.localization.connectWallet}
        </Button>
      </div>
      <Card className="p-0">
        <CardContent className="flex flex-col gap-2 p-0">
          {wallets.isPending ? (
            <div className="flex items-center gap-3 p-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : wallets.data?.length ? (
            wallets.data.map((wallet) => (
              <WalletRow key={wallet.id} wallet={wallet} />
            ))
          ) : (
            <div className="flex items-center gap-3 p-4 text-muted-foreground">
              <Wallet className="size-5" />
              <p className="text-sm">{plugin.localization.noWallets}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
