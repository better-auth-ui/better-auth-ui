"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useEffect, useRef } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { useSignOut } from "@/hooks/auth/use-sign-out"
import { cn } from "@/lib/utils"

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
      className={cn(
        "w-full max-w-sm py-4 md:py-6 gap-6 bg-transparent border-none",
        className
      )}
    >
      <CardContent className="flex items-center justify-center min-h-[200px]">
        <Spinner className="mx-auto my-auto" />
      </CardContent>
    </Card>
  )
}
