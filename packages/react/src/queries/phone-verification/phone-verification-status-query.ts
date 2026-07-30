import {
  type GetPhoneVerificationStatusParams,
  type PhoneVerificationError,
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  phoneVerificationQueryKeys,
  phoneVerificationTerminalStatuses
} from "@better-auth-ui/core/plugins"
import { type QueryClient, queryOptions, useQuery } from "@tanstack/react-query"

export type PhoneVerificationStatusParams = GetPhoneVerificationStatusParams & {
  /**
   * Interval in milliseconds between status polls while pending. Polling
   * stops automatically once a terminal status is reached.
   * @default 3000
   */
  pollingInterval?: number
}

export type PhoneVerificationStatusOptions = Omit<
  ReturnType<typeof phoneVerificationStatusOptions>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for a verification session's status.
 *
 * Polls at `pollingInterval` while the session is pending and stops
 * automatically once a terminal status (`verified`, `expired`, `cancelled`,
 * `timeout`, `failed`) is reached.
 *
 * @param client - The phone verification client (from the plugin config).
 * @param params - Session id, flow, and polling interval.
 */
export function phoneVerificationStatusOptions(
  client: PhoneVerificationProvider,
  params: PhoneVerificationStatusParams
) {
  const { sessionId, flow, pollingInterval = 3000 } = params
  const queryKey = phoneVerificationQueryKeys.status(sessionId)

  return queryOptions<
    PhoneVerificationResult,
    PhoneVerificationError,
    PhoneVerificationResult,
    typeof queryKey
  >({
    queryKey,
    queryFn: () => client.getVerificationStatus({ sessionId, flow }),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status && phoneVerificationTerminalStatuses.includes(status)) {
        return false
      }

      return pollingInterval
    },
    // Keep polling while the user is in WhatsApp — on mobile the page is
    // backgrounded during the round-trip.
    refetchIntervalInBackground: true
  })
}

/**
 * Subscribe to a verification session's status via TanStack Query.
 *
 * @param client - The phone verification client (from the plugin config).
 * @param params - Session id, flow, and polling interval.
 * @param options - React Query options forwarded to `useQuery` (e.g. `enabled`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function usePhoneVerificationStatus(
  client: PhoneVerificationProvider,
  params: PhoneVerificationStatusParams,
  options?: PhoneVerificationStatusOptions,
  queryClient?: QueryClient
) {
  return useQuery(
    {
      ...phoneVerificationStatusOptions(client, params),
      ...options
    },
    queryClient
  )
}
