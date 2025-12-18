"use client"

import { useAuthenticate } from "@better-auth-ui/shadcn/react"
import { Spinner } from "@heroui/react"
import Link from "next/link"

/**
 * Render the dashboard UI: show a full-page loading spinner while authentication is pending, then greet the authenticated user by email and present a Sign Out link.
 *
 * @returns A React element that displays a centered spinner when no session exists, or a centered greeting with `sessionData.user.email` and a link to `/auth/sign-out` when authenticated.
 */
export default function Dashboard() {
  const { data: sessionData } = useAuthenticate()

  if (!sessionData) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Spinner color="current" />
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">Hello, {sessionData.user.email}</h1>

      <Link href="/auth/sign-out">Sign Out</Link>
    </div>
  )
}