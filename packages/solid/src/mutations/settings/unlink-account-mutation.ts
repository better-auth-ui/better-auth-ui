import {
  type AuthClient,
  type UnlinkAccountOptions,
  unlinkAccountOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"

export type { UnlinkAccountParams } from "@better-auth-ui/core"

export function useUnlinkAccount<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UnlinkAccountOptions<TAuthClient>
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...unlinkAccountOptions(authClient, userId),
      ...options
    }
  })
}

export const unlinkAccountMutation = useUnlinkAccount
