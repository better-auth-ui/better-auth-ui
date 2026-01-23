import { useAuth } from "@better-auth-ui/react"
import type { AuthError } from "@better-auth-ui/react/core"
import { useQueryClient } from "@tanstack/react-query"
import { useActionState } from "react"

interface UseSignInEmailOptions {
  onError?: (
    error: AuthError,
    context: { email: string }
  ) => unknown | Promise<unknown>
  onSuccess?: (context: {
    email: string
    password: string
  }) => unknown | Promise<unknown>
}

/**
 * Create an action state that signs a user in with email and password.
 *
 * The action sends an email/password sign-in request, invalidates the auth query cache and navigates to the configured redirect on success. On error the action returns the submitted email with an empty password; on success it returns the submitted email and password.
 *
 * @param options - Optional callbacks for error and success handling
 * @returns An action state object whose action performs the email sign-in and resolves to an object `{ email, password }` (password preserved on success, set to `""` on error).
 */
export function useSignInEmail({
  onError,
  onSuccess
}: UseSignInEmailOptions = {}) {
  const { authClient, emailAndPassword, redirectTo, navigate } = useAuth()
  const queryClient = useQueryClient()

  const signInEmail = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const rememberMe = formData.get("rememberMe") === "on"

    const { error } = await authClient.signIn.email({
      email,
      password,
      ...(emailAndPassword?.rememberMe ? { rememberMe } : {})
    })

    if (error) {
      await onError?.(error, { email })

      return {
        email,
        password: ""
      }
    }

    await onSuccess?.({ email, password })

    await queryClient.invalidateQueries({ queryKey: ["auth"] })

    navigate({ href: redirectTo })

    return { email, password }
  }

  return useActionState(signInEmail, {
    email: "",
    password: ""
  })
}
