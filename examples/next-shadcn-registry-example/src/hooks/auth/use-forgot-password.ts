import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useMutation } from "@tanstack/react-query"

import { useAuth } from "./use-auth"

export function useForgotPassword(config?: AnyAuthConfig) {
  const { authClient, basePaths, viewPaths, navigate } = useAuth(config)

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${basePaths.auth}/${viewPaths.auth.resetPassword}`,
        fetchOptions: { throw: true }
      })

      return result
    },
    onSuccess: () => {
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
    }
  })
}
