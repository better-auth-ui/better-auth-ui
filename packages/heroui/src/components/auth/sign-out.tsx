import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useSignOut } from "@better-auth-ui/react"
import { Card, Spinner } from "@heroui/react"
import { useEffect, useRef } from "react"

import { useAuth } from "../../hooks/use-auth"
import { cn } from "../../lib/utils"

export type SignOutProps = AnyAuthConfig & {
  className?: string
}

/**
 * Signs the current user out when mounted and displays a loading card while the operation completes.
 */
export function SignOut({ className, ...config }: SignOutProps) {
  const context = useAuth(config)
  const { signOut } = useSignOut(context)

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
