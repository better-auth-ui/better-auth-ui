import {
  authMutationKeys,
  authQueryKeys,
  isPasswordCompromisedError,
  isSessionNotFreshError
} from "@better-auth-ui/core"
import { oneTapMutationKeys } from "@better-auth-ui/core/plugins/one-tap"
import {
  matchMutation,
  matchQuery,
  useQueryClient
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { onCleanup, onMount } from "solid-js"
import { toast } from "solid-sonner"

export function ErrorToaster() {
  const queryClient = useQueryClient()

  onMount(() => {
    const queryCache = queryClient.getQueryCache()
    const previousQueryOnError = queryCache.config.onError

    queryCache.config.onError = (error, query) => {
      previousQueryOnError?.(error, query)

      if (!matchQuery({ queryKey: authQueryKeys.all }, query)) return
      if (isSessionNotFreshError(error)) return

      const err = error as BetterFetchError
      if (err?.error?.code === "EMAIL_NOT_VERIFIED") return
      if (err?.error) toast.error(err.error.message)
    }

    const mutationCache = queryClient.getMutationCache()
    const previousMutationOnError = mutationCache.config.onError

    mutationCache.config.onError = (
      error,
      variables,
      onMutateResult,
      mutation,
      context
    ) => {
      previousMutationOnError?.(
        error,
        variables,
        onMutateResult,
        mutation,
        context
      )

      if (!matchMutation({ mutationKey: authMutationKeys.all }, mutation)) {
        return
      }
      if (isSessionNotFreshError(error)) return
      // Every form that sets a new password renders this one against the
      // password field, so a toast would just repeat it.
      if (isPasswordCompromisedError(error)) return

      const err = error as BetterFetchError
      if (
        err.error?.code === "EMAIL_NOT_VERIFIED" &&
        !matchMutation({ mutationKey: oneTapMutationKeys.prompt }, mutation)
      ) {
        return
      }
      toast.error(err.error?.message || err.message)
    }

    onCleanup(() => {
      queryCache.config.onError = previousQueryOnError
      mutationCache.config.onError = previousMutationOnError
    })
  })

  return null
}
