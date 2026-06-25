import {
  matchMutation,
  matchQuery,
  type QueryClient,
  type QueryKey
} from "@tanstack/query-core"
import { authMutationKeys } from "./auth-mutation-keys"

type AuthMutationMeta = {
  invalidates?: Array<QueryKey>
  awaits?: Array<QueryKey>
  removes?: Array<QueryKey>
}

/**
 * Sets up global mutation invalidation for Better Auth mutations.
 *
 * @param queryClient
 * @returns Cleanup function
 */
export function setupMutationInvalidation(queryClient: QueryClient) {
  const mutationCache = queryClient.getMutationCache()
  const previousOnSuccess = mutationCache.config.onSuccess

  mutationCache.config.onSuccess = async (
    data,
    variables,
    onMutateResult,
    mutation,
    context
  ) => {
    await previousOnSuccess?.(
      data,
      variables,
      onMutateResult,
      mutation,
      context
    )

    if (!matchMutation({ mutationKey: authMutationKeys.all }, mutation)) {
      return
    }

    const { invalidates, awaits, removes } = (mutation.meta ??
      {}) as AuthMutationMeta

    if (removes?.length) {
      queryClient.removeQueries({
        predicate: (query) =>
          removes.some((queryKey) => matchQuery({ queryKey }, query))
      })
    }

    if (invalidates?.length) {
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidates.some((queryKey) => matchQuery({ queryKey }, query))
      })
    }

    if (awaits?.length) {
      return queryClient.invalidateQueries(
        {
          predicate: (query) =>
            awaits.some((queryKey) => matchQuery({ queryKey }, query))
        },
        { cancelRefetch: false }
      )
    }
  }

  return () => {
    mutationCache.config.onSuccess = previousOnSuccess
  }
}
