import {
  type CreatePhoneVerificationParams,
  type PhoneVerificationError,
  type PhoneVerificationProvider,
  type PhoneVerificationSession,
  phoneVerificationMutationKeys
} from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"

export type CreatePhoneVerificationOptions = Omit<
  ReturnType<typeof createPhoneVerificationOptions>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for starting a phone verification session.
 *
 * @param client - The phone verification client (from the plugin config).
 */
export function createPhoneVerificationOptions(
  client: PhoneVerificationProvider
) {
  const mutationKey = phoneVerificationMutationKeys.createVerification

  const mutationFn = (params: CreatePhoneVerificationParams) =>
    client.createVerification(params)

  return mutationOptions<
    PhoneVerificationSession,
    PhoneVerificationError,
    CreatePhoneVerificationParams
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Create a mutation for starting a phone verification session.
 *
 * Wraps `client.createVerification` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param client - The phone verification client (from the plugin config).
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useCreatePhoneVerification(
  client: PhoneVerificationProvider,
  options?: CreatePhoneVerificationOptions
) {
  return useMutation({
    ...createPhoneVerificationOptions(client),
    ...options
  })
}
