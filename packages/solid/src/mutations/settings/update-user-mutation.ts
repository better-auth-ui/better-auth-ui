import { type AuthClient, updateUserOptions } from "@better-auth-ui/core"
import { createMutation } from "@tanstack/solid-query"

export type UpdateUserParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["updateUser"]
>[0]

export function updateUserMutation<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createMutation(() => updateUserOptions(authClient))
}
