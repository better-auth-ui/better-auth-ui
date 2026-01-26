"use client"

import { useAuth, useSignOut } from "@better-auth-ui/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
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
  const { basePaths, navigate, viewPaths } = useAuth()

  const { mutate: signOut } = useSignOut({
    onError: (error) => {
      toast.error(error.error?.message || error.message)
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
      className={cn("w-full max-w-sm bg-transparent border-none", className)}
    >
      <CardContent className="flex items-center justify-center">
        <Spinner className="mx-auto my-auto" />
      </CardContent>
    </Card>
  )
}
