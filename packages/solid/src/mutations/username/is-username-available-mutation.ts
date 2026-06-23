import { usernameMutationKeys } from "@better-auth-ui/core/plugins/username"
import { useMutation } from "@tanstack/solid-query"
import type { UsernameAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type IsUsernameAvailableParams<TAuthClient extends UsernameAuthClient> =
  Parameters<TAuthClient["isUsernameAvailable"]>[0]

export type IsUsernameAvailableOptions = Omit<
  ReturnType<typeof isUsernameAvailableOptions<UsernameAuthClient>>,
  "mutationKey" | "mutationFn"
>

export function isUsernameAvailableOptions<
  TAuthClient extends UsernameAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.isUsernameAvailable,
    usernameMutationKeys.isUsernameAvailable
  )
}

export function useIsUsernameAvailable<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: IsUsernameAvailableOptions
) {
  return useMutation(() => ({
    ...isUsernameAvailableOptions(authClient),
    ...options
  }))
}
