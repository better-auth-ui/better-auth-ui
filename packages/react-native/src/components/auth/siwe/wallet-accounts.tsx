import type { SiweAuthClient } from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useLinkSiweWallet,
  useSetPrimarySiweWallet,
  useSiweWallets,
  useUnlinkSiweWallet
} from "@better-auth-ui/react/plugins/siwe"
import { useState } from "react"
import { siwePlugin } from "../../../lib/auth/siwe-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"

export function WalletAccounts(props: CardSlotProps) {
  const { authClient, localization: common } = useAuth()
  const { connector, localization, walletManager } = useAuthPlugin(siwePlugin)
  if (!walletManager)
    throw new Error("Configure walletManager to render WalletAccounts.")
  const client = authClient as SiweAuthClient
  const wallets = useSiweWallets(client, walletManager)
  const link = useLinkSiweWallet(client, walletManager, connector)
  const remove = useUnlinkSiweWallet(client, walletManager)
  const primary = useSetPrimarySiweWallet(client, walletManager)
  const [removing, setRemoving] = useState<string | null>(null)
  const pending = link.isPending || remove.isPending || primary.isPending
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{localization.wallets}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <Description>{localization.walletsDescription}</Description>
        <Button
          isPending={link.isPending}
          isDisabled={pending}
          onPress={() => link.mutate()}
        >
          {localization.connectWallet}
        </Button>
        {wallets.isPending ? <Skeleton className="h-10 w-full" /> : null}
        {wallets.error ? (
          <Txt accessibilityRole="alert">{wallets.error.message}</Txt>
        ) : null}
        {wallets.data?.length === 0 ? (
          <Description>{localization.noWallets}</Description>
        ) : null}
        {wallets.data?.map((wallet) => (
          <Box key={wallet.id} className="gap-2">
            <Txt selectable>{wallet.address}</Txt>
            <Description>
              {localization.chain.replace(
                "{{chainId}}",
                String(wallet.chainId)
              )}
            </Description>
            {wallet.isPrimary ? (
              <Txt>{localization.primary}</Txt>
            ) : (
              <Button
                isDisabled={pending}
                onPress={() => primary.mutate(wallet.id)}
              >
                {localization.setPrimary}
              </Button>
            )}
            <Button
              variant="danger"
              isDisabled={pending}
              onPress={() => setRemoving(wallet.id)}
            >
              {localization.removeWallet}
            </Button>
          </Box>
        ))}
      </Card.Content>
      <AlertDialog
        isOpen={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setRemoving(null)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.removeWalletTitle}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <Description>{localization.removeWalletWarning}</Description>
        <AlertDialog.Footer>
          <Button
            isDisabled={remove.isPending}
            onPress={() => setRemoving(null)}
          >
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={remove.isPending}
            onPress={() =>
              removing &&
              remove.mutate(removing, { onSuccess: () => setRemoving(null) })
            }
          >
            {localization.removeWallet}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Card>
  )
}
