import {
  type CancelPhoneVerificationParams,
  type PhoneVerificationError,
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  phoneVerificationMutationKeys
} from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"

export type CancelPhoneVerificationOptions = Omit<
  ReturnType<typeof cancelPhoneVerificationOptions>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for cancelling a phone verification session.
 *
 * @param client - The phone verification client (from the plugin config).
 */
export function cancelPhoneVerificationOptions(
  client: PhoneVerificationProvider
) {
  const mutationKey = phoneVerificationMutationKeys.cancelVerification

  const mutationFn = (params: CancelPhoneVerificationParams) =>
    client.cancelVerification(params)

  return mutationOptions<
    PhoneVerificationResult,
    PhoneVerificationError,
    CancelPhoneVerificationParams
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Create a mutation for cancelling a phone verification session.
 *
 * Wraps `client.cancelVerification` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param client - The phone verification client (from the plugin config).
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useCancelPhoneVerification(
  client: PhoneVerificationProvider,
  options?: CancelPhoneVerificationOptions
) {
  return useMutation({
    ...cancelPhoneVerificationOptions(client),
    ...options
  })
}
