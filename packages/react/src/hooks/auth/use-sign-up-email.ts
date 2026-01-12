import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useActionState } from "react"

/**
 * Creates an action state for performing email/password sign-up and handling post-sign-up flow.
 *
 * Validates the optional confirm-password field, shows localized toast messages on mismatch or API errors,
 * triggers email verification flow when required, invalidates auth queries on successful sign-up when verification
 * is not required, and navigates to the appropriate view after completion.
 *
 * @returns The action state returned by `useActionState` that manages the email sign-up operation and the form fields `name`, `email`, `password`, and `confirmPassword`.
 */
export function useSignUpEmail() {
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
    if (emailAndPassword?.confirmPassword) {
      if (password !== confirmPassword) {
        toast.error(localization.auth.passwordsDoNotMatch)

        return {
          name,
          email,
          password: "",
          confirmPassword: ""
        }
      }
    }

    const { error } = await authClient.signUp.email({
      name,
      email,
      password
    })

    if (error) {
      toast.error(error.message || error.statusText)

      return {
        name,
        email,
        password: "",
        confirmPassword: ""
      }
    }

    if (emailAndPassword?.requireEmailVerification) {
      toast.success(localization.auth.verifyYourEmail)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
    } else {
      await queryClient.invalidateQueries({ queryKey: ["auth"] })

      navigate(redirectTo)
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
