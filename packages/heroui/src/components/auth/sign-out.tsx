import { useAuth, useSignOut } from "@better-auth-ui/react"
import { Card, type CardProps, Spinner, toast } from "@heroui/react"
import { useEffect, useRef } from "react"

import { cn } from "../../lib/utils"

export type SignOutProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Initiates sign-out on mount and renders a loading card while sign-out proceeds.
 *
 * @returns A Card containing a centered Spinner shown during the sign-out process
 */
export function SignOut({ className, ...props }: SignOutProps & CardProps) {
  const { basePaths, navigate, viewPaths } = useAuth()

  const { mutate: signOut } = useSignOut({
    onError: (error) => {
      toast.danger(error.error?.message || error.message, { timeout: 3000 })
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true
      })
    },
    onSuccess: () =>
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true
      })
  })

  const hasSignedOut = useRef(false)

  useEffect(() => {
    if (hasSignedOut.current) return
    hasSignedOut.current = true

    signOut()
  }, [signOut])

  return (
    <Card
      variant="transparent"
      className={cn("w-full max-w-sm", className)}
      {...props}
    >
      <Spinner className="mx-auto my-auto" color="current" />
    </Card>
  )
}
