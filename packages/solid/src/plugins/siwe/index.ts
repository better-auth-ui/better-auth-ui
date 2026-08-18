import {
  linkSiweWalletOptions,
  type SignInSiweConfig,
  type SiweAuthClient,
  type SiweWalletConnector,
  type SiweWalletManager,
  setPrimarySiweWalletOptions,
  signInSiweOptions,
  siweWalletsOptions,
  unlinkSiweWalletOptions
} from "@better-auth-ui/core/plugins/siwe"
import { type QueryClient, useMutation, useQuery } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../hooks/queries/use-session"

export const useSignInSiwe = (
  authClient: SiweAuthClient,
  config: Accessor<SignInSiweConfig>,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => signInSiweOptions(authClient, config()), queryClient)

export const useSiweWallets = (
  authClient: SiweAuthClient,
  manager: Accessor<SiweWalletManager | undefined>,
  queryClient?: Accessor<QueryClient>
) => {
  const session = useSession(authClient, undefined, queryClient)
  return useQuery(
    () => siweWalletsOptions(manager(), session.data?.user.id),
    queryClient
  )
}

export const useLinkSiweWallet = (
  authClient: SiweAuthClient,
  manager: SiweWalletManager,
  connector: Accessor<SiweWalletConnector>,
  queryClient?: Accessor<QueryClient>
) => {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => linkSiweWalletOptions(manager, connector(), session.data?.user.id),
    queryClient
  )
}

export const useUnlinkSiweWallet = (
  authClient: SiweAuthClient,
  manager: SiweWalletManager,
  queryClient?: Accessor<QueryClient>
) => {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => unlinkSiweWalletOptions(manager, session.data?.user.id),
    queryClient
  )
}

export const useSetPrimarySiweWallet = (
  authClient: SiweAuthClient,
  manager: SiweWalletManager,
  queryClient?: Accessor<QueryClient>
) => {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => setPrimarySiweWalletOptions(manager, session.data?.user.id),
    queryClient
  )
}
