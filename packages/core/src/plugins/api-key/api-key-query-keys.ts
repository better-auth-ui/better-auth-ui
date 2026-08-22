import { authQueryKeys } from "../../lib/auth-query-keys"

/** Query key factory for API key queries, scoped per user. */
export const apiKeyQueryKeys = {
  all: (userId: string | undefined) =>
    [...authQueryKeys.user(userId), "apiKey"] as const,

  lists: (userId: string | undefined) =>
    [...apiKeyQueryKeys.all(userId), "list"] as const,

  list: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
    [...apiKeyQueryKeys.lists(userId), query ?? null] as const,

  details: (userId: string | undefined) =>
    [...apiKeyQueryKeys.all(userId), "detail"] as const,

  detail: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
    [...apiKeyQueryKeys.details(userId), query ?? null] as const
} as const
