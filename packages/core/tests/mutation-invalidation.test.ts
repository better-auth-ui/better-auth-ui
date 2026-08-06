import { QueryClient } from "@tanstack/query-core"
import { describe, expect, it } from "vitest"
import {
  authMutationKeys,
  authQueryKeys,
  setupMutationInvalidation
} from "../src"

describe("setupMutationInvalidation", () => {
  it("removes queries declared by mutation metadata", async () => {
    const queryClient = new QueryClient()
    const cleanup = setupMutationInvalidation(queryClient)

    queryClient.setQueryData(authQueryKeys.session, { data: "session" })

    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationKey: authMutationKeys.signOut,
      mutationFn: async () => true,
      meta: {
        removes: [authQueryKeys.all]
      }
    })

    await mutation.execute(undefined)

    expect(queryClient.getQueryData(authQueryKeys.session)).toBeUndefined()

    cleanup()
  })
})
