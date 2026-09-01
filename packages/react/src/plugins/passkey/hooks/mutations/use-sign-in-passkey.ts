import {
  type PasskeyAuthClient,
  type SignInPasskeyOptions,
  signInPasskeyOptions
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for passkey sign-in.
 *
 * Use `fetchOptions.onSuccess` for side effects that require a verified
 * passkey. Better Auth resolves cancelled ceremonies as mutation results.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: SignInPasskeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInPasskeyOptions(authClient),
      ...options
    },
    queryClient
  )
}
