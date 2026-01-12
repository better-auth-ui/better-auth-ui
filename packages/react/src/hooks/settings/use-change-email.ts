import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Hook that creates an action state for changing the current user's email address.
 *
 * The action sends an email-change request and shows success or error toasts.
 * On success the callback URL is set to the account settings view.
 *
 * @returns The `useActionState` result whose state holds the submitted email (initialized to `""`).
 */
export function useChangeEmail() {
  const { authClient, baseURL, localization, toast, viewPaths } = useAuth()

  const changeEmail = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const { error } = await authClient.changeEmail({
      newEmail: email,
      callbackURL: `${baseURL}/${viewPaths.settings.account}`
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      toast.success(localization.settings.changeEmailSuccess)
    }

    return { email }
  }

  return useActionState(changeEmail, { email: "" })
}
