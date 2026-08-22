import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoQueryKeys } from "./sso-query-keys"

type SsoResultError = {
  message?: string
  status: number
  statusText: string
}

export class SsoClientError extends Error {
  readonly status: number
  readonly statusText: string

  constructor(error: SsoResultError) {
    super(error.message || error.statusText || "SSO request failed")
    this.name = "SsoClientError"
    this.status = error.status
    this.statusText = error.statusText
  }
}

export type SsoProvidersResponse = NonNullable<
  InferData<SsoAuthClient["sso"]["providers"]>
>
export type SsoProvider = SsoProvidersResponse["providers"][number]
export type SsoProviderResponse = NonNullable<
  InferData<SsoAuthClient["sso"]["getProvider"]>
>

const unwrapSsoResult = <TData>(
  result: { data: TData; error: null } | { data: null; error: SsoResultError }
) => {
  if (result.error) throw new SsoClientError(result.error)
  return result.data
}

export function ssoProvidersOptions(
  authClient: SsoAuthClient,
  userId?: string
) {
  return {
    queryKey: ssoQueryKeys.providers.list(userId),
    queryFn: userId
      ? async ({ signal }) => {
          const data = unwrapSsoResult(
            await authClient.sso.providers({ fetchOptions: { signal } })
          )
          if (!data) {
            throw new SsoClientError({
              message: "SSO providers unavailable",
              status: 500,
              statusText: "Internal Server Error"
            })
          }
          return data
        }
      : skipToken
  } satisfies QueryOptions<SsoProvidersResponse>
}

export function ssoProviderOptions(
  authClient: SsoAuthClient,
  userId?: string,
  providerId?: string
) {
  return {
    queryKey: ssoQueryKeys.providers.detail(userId, providerId),
    queryFn:
      userId && providerId
        ? async ({ signal }) => {
            const data = unwrapSsoResult(
              await authClient.sso.getProvider({
                query: { providerId },
                fetchOptions: { signal }
              })
            )
            if (!data) {
              throw new SsoClientError({
                message: "SSO provider not found",
                status: 404,
                statusText: "Not Found"
              })
            }
            return data
          }
        : skipToken
  } satisfies QueryOptions<SsoProviderResponse>
}

export const ensureSsoProviders = (
  queryClient: QueryClient,
  authClient: SsoAuthClient,
  userId: string
) => queryClient.ensureQueryData(ssoProvidersOptions(authClient, userId))

export const fetchSsoProvider = (
  queryClient: QueryClient,
  authClient: SsoAuthClient,
  userId: string,
  providerId: string
) => queryClient.fetchQuery(ssoProviderOptions(authClient, userId, providerId))
