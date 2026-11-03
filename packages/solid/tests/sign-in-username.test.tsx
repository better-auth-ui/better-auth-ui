import { authQueryKeys, getAuthErrorPresentation } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../src"
import { useSignInUsername } from "../src/plugins/username"

describe("username sign-in mutation options", () => {
  it.each([undefined, "inline"] as const)(
    "uses the supplied query client and preserves session invalidation with %s presentation",
    async (errorPresentation) => {
      const error = { error: { message: "Invalid username or password" } }
      const username = vi.fn(async () => {
        throw error
      })
      const authClient = { signIn: { username } }
      const defaultClient = new QueryClient()
      const queryClient = new QueryClient()
      const onError = vi.fn()
      let submit!: () => Promise<unknown>

      function MutationConsumer() {
        const mutation = useSignInUsername(
          authClient as never,
          () => ({
            onError,
            ...(errorPresentation ? { meta: { errorPresentation } } : {})
          }),
          () => queryClient
        )
        submit = () =>
          mutation.mutateAsync({ username: "ada", password: "password123" })
        return null
      }

      renderToString(() => (
        <AuthProvider
          authClient={authClient as never}
          queryClient={defaultClient}
        >
          {() => <MutationConsumer />}
        </AuthProvider>
      ))

      await expect(submit()).rejects.toBe(error)
      expect(username).toHaveBeenCalledExactlyOnceWith({
        username: "ada",
        password: "password123",
        fetchOptions: { throw: true }
      })
      expect(onError).toHaveBeenCalledOnce()
      expect(defaultClient.getMutationCache().getAll()).toHaveLength(0)
      const mutations = queryClient.getMutationCache().getAll()
      expect(mutations).toHaveLength(1)
      expect(mutations[0]?.meta?.awaits).toEqual([authQueryKeys.session])
      expect(getAuthErrorPresentation(mutations[0]?.meta)).toBe(
        errorPresentation ?? "toast"
      )
      queryClient.clear()
      defaultClient.clear()
    }
  )
})
