import {
  authMutationKeys,
  authQueryKeys,
  getAuthErrorCode,
  getAuthErrorMessage,
  getAuthErrorPresentation,
  isReauthenticationRequiredError,
  isPasswordCompromisedError
} from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { toast } from "../../primitives/toast"
import { useNativeReauthentication } from "./reauthentication"
import {
  matchMutation,
  matchQuery,
  useQueryClient
} from "@tanstack/react-query"
import { useEffect } from "react"

export function ErrorToaster() {
  const { localization } = useAuth()
  const queryClient = useQueryClient()
  const recovery = useNativeReauthentication()

  useEffect(() => {
    const queryCache = queryClient.getQueryCache()
    const previousQueryOnError = queryCache.config.onError

    queryCache.config.onError = (error, query) => {
      previousQueryOnError?.(error, query)

      if (!matchQuery({ queryKey: authQueryKeys.all }, query)) return
      if (isReauthenticationRequiredError(error)) {
        recovery.capture(() => query.fetch())
        return
      }
      if (getAuthErrorPresentation(query.meta) !== "toast") return

      if (getAuthErrorCode(error) === "EMAIL_NOT_VERIFIED") return
      const message = getAuthErrorMessage(error, localization)
      if (message) {
        toast.danger(message)
      }
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
      if (isReauthenticationRequiredError(error)) {
        recovery.capture(() => mutation.execute(variables))
        return
      }
      if (getAuthErrorPresentation(mutation.meta) !== "toast") return
      // Every form that sets a new password renders this one against the
      // password field, so a toast would just repeat it.
      if (isPasswordCompromisedError(error)) return

      if (getAuthErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        return
      }
      const message = getAuthErrorMessage(
        error,
        localization,
        mutation.options.mutationKey
      )
      if (message) {
        toast.danger(message)
      }
    }

    return () => {
      queryCache.config.onError = previousQueryOnError
      mutationCache.config.onError = previousMutationOnError
    }
  }, [queryClient, localization, recovery])

  return null
}
