"use client"

import { Spinner } from "@heroui/react"
import Link from "next/link"

import { useAuthenticate } from "@/hooks/auth/use-authenticate"

/**
 * Renders the dashboard UI for an authenticated user or a centered loading spinner while authentication is pending.
 *
 * Displays a greeting that includes the authenticated user's email and a "Sign Out" link once session data is available.
 *
 * @returns The dashboard UI as JSX element (a loading spinner when unauthenticated or the user greeting and sign-out link when authenticated).
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