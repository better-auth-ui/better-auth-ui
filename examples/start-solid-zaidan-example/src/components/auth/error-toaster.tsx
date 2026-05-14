import { useQueryClient } from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { onMount } from "solid-js"
import { toast } from "solid-sonner"

const resolveErrorMessage = (error: Error) =>
  (error as BetterFetchError)?.error?.message || error.message

export function ErrorToaster() {
  const queryClient = useQueryClient()

  onMount(() => {
    queryClient.getQueryCache().config.onError = (error) => {
      const err = error as BetterFetchError
      if (err?.error) toast.error(err.error.message)
    }

    queryClient.setMutationDefaults([], {
      onError: (error) => {
        toast.error(resolveErrorMessage(error))
      }
    })
  })

  return null
}
