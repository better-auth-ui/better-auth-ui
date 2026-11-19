import {
  linkSiweWalletOptions,
  type SignInSiweConfig,
  type SiweAuthClient,
  type SiweWalletConnector,
  type SiweWalletManager,
  setPrimarySiweWalletOptions,
  signInSiweOptions,
  siweWalletsOptions,
  unlinkSiweWalletOptions,
  type SiweWalletAccount
} from "@better-auth-ui/core/plugins/siwe"
import {
  type QueryClient,
  useMutation,
  type UseMutationResult,
  useQuery,
  type UseQueryResult
} from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

export const useSignInSiwe = (
  authClient: SiweAuthClient,
  config: SignInSiweConfig,
  queryClient?: QueryClient
) => useMutation(signInSiweOptions(authClient, config), queryClient)

export const useSiweWallets = (
  authClient: SiweAuthClient,
  manager?: SiweWalletManager,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<SiweWalletAccount[]>> => {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useQuery(siweWalletsOptions(manager, session?.user.id), queryClient)
}

export const useLinkSiweWallet = (
  authClient: SiweAuthClient,
  manager: SiweWalletManager,
  connector: SiweWalletConnector,
  queryClient?: QueryClient
): UseMutationResult<void, Error, void> => {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    linkSiweWalletOptions(manager, connector, session?.user.id),
    queryClient
  )
}

export const useUnlinkSiweWallet = (
  authClient: SiweAuthClient,
  manager: SiweWalletManager,
  queryClient?: QueryClient
): UseMutationResult<void, Error, string> => {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    unlinkSiweWalletOptions(manager, session?.user.id),
    queryClient
  )
}

export const useSetPrimarySiweWallet = (
  authClient: SiweAuthClient,
  manager: SiweWalletManager,
  queryClient?: QueryClient
): UseMutationResult<void, Error, string> => {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    setPrimarySiweWalletOptions(manager, session?.user.id),
    queryClient
  )
}
