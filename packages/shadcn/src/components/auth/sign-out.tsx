"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useSignOut } from "@/hooks/auth/use-sign-out"
import { cn } from "@/lib/utils"

export type SignOutProps = {
  className?: string
}

/**
 * Signs the current user out on mount and renders a centered loading card while the operation completes.
 *
 * @param className - Optional additional class names appended to the root Card
 * @returns The loading Card element shown during sign-out
 */
export function SignOut({ className }: SignOutProps) {
  const { signOut } = useSignOut({
    onError: (error) => toast.error(error.message || error.statusText)
  })

  const hasSignedOut = useRef(false)

  useEffect(() => {
    if (hasSignedOut.current) return
    hasSignedOut.current = true

    signOut()
  }, [signOut])

  return (
    <Card
      className={cn("w-full max-w-sm bg-transparent border-none", className)}
    >
      <CardContent className="flex items-center justify-center min-h-[200px]">
        <Spinner className="mx-auto my-auto" />
      </CardContent>
    </Card>
  )
}
