import { setupMutationInvalidation } from "@better-auth-ui/core"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export function MutationInvalidator() {
  const queryClient = useQueryClient()

  useEffect(() => {
    return setupMutationInvalidation(queryClient)
  }, [queryClient])

  return null
}
