/**
 * Hierarchical query key factory for every Better Auth query managed by
 * this library.
 *
 * Keys are nested — higher-level keys are valid prefixes of their
 * descendants — so a single call can invalidate a whole subtree:
 *
 * ```ts
 * queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
 * queryClient.invalidateQueries({ queryKey: authQueryKeys.user(userId) })
 * queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
 * ```
 *
 * This factory lives in `@better-auth-ui/core` so it can be shared across
 * framework packages (`@better-auth-ui/react`, a future `/solid` package,
 * etc.) and across client- and server-side query variants — the cache
 * entries line up regardless of which query options factory produced them.
 *
 * Plugin-specific query keys live alongside their plugin (e.g.
 * `apiKeyQueryKeys`, `organizationQueryKeys`, `passkeyQueryKeys`,
 * `multiSessionQueryKeys`) and chain off `authQueryKeys.user(userId)` so
 * everything still sits under the shared `["auth", "user", userId, ...]`
 * subtree.
 *
 * For mutation keys, see `authMutationKeys` in `./auth-mutation-keys`.
 */
export const authQueryKeys = {
  /** Root key for every Better Auth query. */
  all: ["auth"] as const,

  /** Key for the current `getSession` query. */
  session: ["auth", "getSession"] as const,

  /** Prefix for every per-user query. */
  users: () => [...authQueryKeys.all, "user"] as const,
  /** Prefix for every query scoped to a specific user. */
  user: (userId?: string) => [...authQueryKeys.users(), userId] as const,

  /** Key for `accountInfo` for the given user. */
  accountInfo: <TQuery = undefined>(userId?: string, query?: TQuery) =>
    [...authQueryKeys.user(userId), "accountInfo", query ?? null] as const,

  /** Key for `listAccounts` for the given user. */
  listAccounts: <TQuery = undefined>(userId?: string, query?: TQuery) =>
    [...authQueryKeys.user(userId), "listAccounts", query ?? null] as const,

  /** Key for `listSessions` for the given user. */
  listSessions: <TQuery = undefined>(userId?: string, query?: TQuery) =>
    [...authQueryKeys.user(userId), "listSessions", query ?? null] as const
} as const
