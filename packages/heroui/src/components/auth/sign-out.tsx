import { useSignOut } from "@better-auth-ui/react"
import { Card, Spinner } from "@heroui/react"
import { useEffect, useRef } from "react"

import { cn } from "../../lib/utils"

export type SignOutProps = {
  className?: string
}

/**
 * Initiates sign-out on mount and renders a loading card while sign-out proceeds.
 *
 * @returns A Card containing a centered Spinner shown during the sign-out process
 */
export function SignOut({ className }: SignOutProps) {
  const { signOut } = useSignOut()

  const hasSignedOut = useRef(false)

  useEffect(() => {
    if (hasSignedOut.current) return
    hasSignedOut.current = true

    signOut()
  }, [signOut])

  return (
    <Card
      variant="transparent"
      className={cn("w-full max-w-sm p-4 md:p-6 gap-6", className)}
    >
      <Spinner className="mx-auto my-auto" color="current" />
    </Card>
  )
}
