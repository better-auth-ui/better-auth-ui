import { authQueryKeys } from "../../lib/auth-query-keys"

/** Query key factory for organization queries, scoped per user. */
export const organizationQueryKeys = {
  all: (userId: string | undefined) =>
    [...authQueryKeys.user(userId), "organization"] as const,

  lists: (userId: string | undefined) =>
    [...organizationQueryKeys.all(userId), "list"] as const,

  list: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
    [...organizationQueryKeys.lists(userId), query ?? null] as const,

  fullDetails: (userId: string | undefined) =>
    [...organizationQueryKeys.all(userId), "fullDetails"] as const,
  fullDetail: <TQuery = undefined>(
    userId: string | undefined,
    query?: TQuery
  ) => [...organizationQueryKeys.fullDetails(userId), query ?? null] as const,

  /**
   * Prefix for every active-organization cache entry (used for invalidation
   * across slug-partitioned variants).
   */
  activeOrganizations: (userId: string | undefined) =>
    [...organizationQueryKeys.all(userId), "active"] as const,
  /**
   * Cache entry for the currently active organization. Holds a {@link
   * ListOrganization}-shaped value — distinct from `fullDetail`, which
   * carries members and invitations — so `setActive`'s optimistic update
   * (which can only produce a list-shaped org) doesn't corrupt the full
   * cache.
   */
  activeOrganization: <TQuery = undefined>(
    userId: string | undefined,
    query?: TQuery
  ) =>
    [
      ...organizationQueryKeys.activeOrganizations(userId),
      query ?? null
    ] as const,

  members: {
    all: (userId: string | undefined) =>
      [...organizationQueryKeys.all(userId), "members"] as const,
    lists: (userId: string | undefined) =>
      [...organizationQueryKeys.members.all(userId), "list"] as const,
    list: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
      [...organizationQueryKeys.members.lists(userId), query ?? null] as const
  },

  invitations: {
    all: (userId: string | undefined) =>
      [...organizationQueryKeys.all(userId), "invitations"] as const,
    details: (userId: string | undefined) =>
      [...organizationQueryKeys.invitations.all(userId), "detail"] as const,
    detail: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
      [
        ...organizationQueryKeys.invitations.details(userId),
        query ?? null
      ] as const,
    lists: (userId: string | undefined) =>
      [...organizationQueryKeys.invitations.all(userId), "list"] as const,
    list: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
      [
        ...organizationQueryKeys.invitations.lists(userId),
        query ?? null
      ] as const
  },

  userInvitations: {
    all: (userId: string | undefined) =>
      [...organizationQueryKeys.all(userId), "userInvitations"] as const,
    lists: (userId: string | undefined) =>
      [...organizationQueryKeys.userInvitations.all(userId), "list"] as const,
    list: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
      [
        ...organizationQueryKeys.userInvitations.lists(userId),
        query ?? null
      ] as const
  },

  permissions: {
    all: (userId: string | undefined) =>
      [...organizationQueryKeys.all(userId), "permissions"] as const,
    has: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
      [
        ...organizationQueryKeys.permissions.all(userId),
        "has",
        query ?? null
      ] as const
  }
} as const
