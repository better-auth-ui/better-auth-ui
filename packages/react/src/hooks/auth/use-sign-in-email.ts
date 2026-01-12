import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useActionState } from "react"

/**
 * Create an action state that signs a user in with email and password.
 *
 * The action sends an email/password sign-in request, invalidates the auth query cache and navigates to the configured redirect on success. If the account's email is not verified, a toast is shown with an action to resend a verification email; other errors are surfaced via toasts. On error the action returns the submitted email with an empty password; on success it returns the submitted email and password.
 *
 * @returns An action state object whose action performs the email sign-in and resolves to an object `{ email, password }` (password preserved on success, set to `""` on error).
 */
export function useSignInEmail() {
  const {
    authClient,
    baseURL,
    emailAndPassword,
    localization,
    redirectTo,
    toast,
    navigate
  } = useAuth()
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
      if (error.code === "EMAIL_NOT_VERIFIED") {
        const toastId = toast.error(error.message || error.statusText, {
          action: {
            label: localization.auth.resend,
            onClick: async () => {
              const callbackURL = `${baseURL}${redirectTo}`

              toast.dismiss?.(toastId)

              const { error } = await authClient.sendVerificationEmail({
                email,
                callbackURL
              })

              if (error) {
                toast.error(error.message || error.statusText)
              } else {
                toast.success(localization.auth.verificationEmailSent)
              }
            }
          }
        })
      } else {
        toast.error(error.message || error.statusText)
      }

      return {
        email,
        password: ""
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["auth"] })

    navigate(redirectTo)

    return { email, password }
  }

  return useActionState(signInEmail, {
    email: "",
    password: ""
  })
}
