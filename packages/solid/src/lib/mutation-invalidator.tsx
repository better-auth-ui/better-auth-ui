import { setupMutationInvalidation } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import { createEffect, onCleanup } from "solid-js"

export function MutationInvalidator(props: { queryClient: QueryClient }) {
  createEffect(() => {
    const cleanup = setupMutationInvalidation(props.queryClient)

    onCleanup(cleanup)
  })

  return null
}
