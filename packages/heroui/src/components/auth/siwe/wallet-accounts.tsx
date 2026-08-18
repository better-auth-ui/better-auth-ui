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
import { Wallet, Xmark } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  type CardProps,
  Chip,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useState } from "react"

import { siwePlugin } from "../../../lib/auth/siwe-plugin"

const shortAddress = (address: string) =>
  address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address

const requireWalletManager = (manager?: SiweWalletManager) => {
  if (!manager) throw new Error("SIWE wallet management is not configured.")
  return manager
}

function RemoveWalletDialog({
  wallet,
  isOpen,
  onOpenChange
}: {
  wallet: SiweWalletAccount
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { authClient, localization } = useAuth()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const unlink = useUnlinkSiweWallet(authClient as SiweAuthClient, manager)

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <Wallet />
            </AlertDialog.Icon>
            <AlertDialog.Heading>
              {plugin.localization.removeWalletTitle}
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p className="text-muted text-sm">
              {plugin.localization.removeWalletWarning}
            </p>
            <code className="mt-3 block break-all rounded-lg bg-surface-secondary p-3 text-xs">
              {wallet.address}
            </code>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button
              slot="close"
              variant="tertiary"
              isDisabled={unlink.isPending}
            >
              {localization.settings.cancel}
            </Button>
            <Button
              variant="danger"
              isPending={unlink.isPending}
              onPress={() =>
                unlink.mutate(wallet.id, {
                  onSuccess: () => onOpenChange(false)
                })
              }
            >
              {unlink.isPending && <Spinner color="current" size="sm" />}
              {plugin.localization.removeWallet}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}

function WalletRow({ wallet }: { wallet: SiweWalletAccount }) {
  const { authClient } = useAuth()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const [removeOpen, setRemoveOpen] = useState(false)
  const setPrimary = useSetPrimarySiweWallet(
    authClient as SiweAuthClient,
    manager
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Wallet className="size-4.5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span
            className="truncate font-mono text-sm font-medium"
            title={wallet.address}
          >
            {shortAddress(wallet.address)}
          </span>
          {wallet.isPrimary && (
            <Chip size="sm">{plugin.localization.primary}</Chip>
          )}
        </div>
        <span className="text-muted text-xs">
          {plugin.localization.chain.replace(
            "{{chainId}}",
            String(wallet.chainId)
          )}
        </span>
      </div>
      {!wallet.isPrimary && (
        <Button
          size="sm"
          variant="outline"
          isPending={setPrimary.isPending}
          onPress={() => setPrimary.mutate(wallet.id)}
        >
          {plugin.localization.setPrimary}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        aria-label={plugin.localization.removeWallet}
        onPress={() => setRemoveOpen(true)}
      >
        <Xmark />
      </Button>
      <RemoveWalletDialog
        wallet={wallet}
        isOpen={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </div>
  )
}

export type WalletAccountsProps = Omit<CardProps, "children"> & {
  className?: string
}

export function WalletAccounts({
  className,
  variant,
  ...props
}: WalletAccountsProps) {
  const { authClient } = useAuth()
  const plugin = useAuthPlugin(siwePlugin)
  const manager = requireWalletManager(plugin.walletManager)
  const wallets = useSiweWallets(authClient as SiweAuthClient, manager)
  const link = useLinkSiweWallet(
    authClient as SiweAuthClient,
    manager,
    plugin.connector
  )

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">
            {plugin.localization.wallets}
          </h2>
          <p className="text-muted text-xs">
            {plugin.localization.walletsDescription}
          </p>
        </div>
        <Button
          className="shrink-0"
          size="sm"
          isPending={link.isPending}
          onPress={() => link.mutate()}
        >
          {link.isPending && <Spinner color="current" size="sm" />}
          {plugin.localization.connectWallet}
        </Button>
      </div>
      <Card variant={variant} {...props}>
        <Card.Content className="flex flex-col gap-4">
          {wallets.isPending ? (
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded-lg" />
              </div>
            </div>
          ) : wallets.data?.length ? (
            wallets.data.map((wallet) => (
              <WalletRow key={wallet.id} wallet={wallet} />
            ))
          ) : (
            <div className="flex items-center gap-3 text-muted">
              <Wallet className="size-5" />
              <p className="text-sm">{plugin.localization.noWallets}</p>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
