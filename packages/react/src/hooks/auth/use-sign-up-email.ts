import { useAuth } from "@better-auth-ui/react"
import type { AuthError } from "@better-auth-ui/react/core"
import { useQueryClient } from "@tanstack/react-query"
import { useActionState } from "react"

interface UseSignUpEmailOptions {
  onError?: (error: AuthError) => unknown | Promise<unknown>
  onSuccess?: () => unknown | Promise<unknown>
}

/**
 * Creates an action state for performing email/password sign-up and handling post-sign-up flow.
 *
 * Validates the optional confirm-password field, triggers callbacks on error/success,
 * triggers email verification flow when required, invalidates auth queries on successful sign-up when verification
 * is not required, and navigates to the appropriate view after completion.
 *
 * @param options - Optional callbacks for error and success handling
 * @returns The action state returned by `useActionState` that manages the email sign-up operation and the form fields `name`, `email`, `password`, and `confirmPassword`.
 */
export function useSignUpEmail({
  onError,
  onSuccess
}: UseSignUpEmailOptions = {}) {
  const queryClient = useQueryClient()
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    redirectTo,
    toast,
    viewPaths,
    navigate
  } = useAuth()

  const signUpEmail = async (_: object, formData: FormData) => {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate confirmPassword if enabled
    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      await onError?.({
        message: localization.auth.passwordsDoNotMatch,
        status: 400,
        statusText: "PASSWORD_MISMATCH"
      })

      return {
        name,
        email,
        password: "",
        confirmPassword: ""
      }
    }

    const { error } = await authClient.signUp.email({
      name,
      email,
      password
    })

    if (error) {
      await onError?.(error)

      return {
        name,
        email,
        password: "",
        confirmPassword: ""
      }
    }

    await onSuccess?.()

    if (emailAndPassword?.requireEmailVerification) {
      toast.success(localization.auth.verifyYourEmail)
      navigate({ href: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    } else {
      await queryClient.invalidateQueries({ queryKey: ["auth"] })

      navigate({ href: redirectTo })
    }

    return {
      name,
      email,
      password,
      confirmPassword
    }
  }

  return useActionState(signUpEmail, {
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
}
