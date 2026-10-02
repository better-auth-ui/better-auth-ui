import { useAuth, useSignOut } from "@better-auth-ui/react"
import { useEffect, useRef } from "react"
import { cn } from "../../lib/cn"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Spinner } from "../../primitives/spinner"

export type SignOutProps = {
  className?: string
}

/**
 * Initiates sign-out on mount and renders a loading card while sign-out proceeds.
 *
 * @returns A Card containing a centered Spinner shown during the sign-out process
 */
export function SignOut({ className }: SignOutProps) {
  const { authClient } = useAuth()
  const navigation = useAuthNavigation()

  const { mutate: signOut } = useSignOut(authClient, {
    onError: () => {
      navigation.push("signIn", { replace: true })
    },
    onSuccess: () => {
      navigation.push("signIn", { replace: true })
    }
  })

  const hasSignedOut = useRef(false)

  useEffect(() => {
    if (hasSignedOut.current) return
    hasSignedOut.current = true

    signOut()
  }, [signOut])

  return (
    <Spinner className={cn("mx-auto my-auto", className)} color="current" />
  )
}
