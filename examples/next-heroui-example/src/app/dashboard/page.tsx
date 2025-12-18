"use client"

import { useAuthenticate } from "@better-auth-ui/heroui/react"
import { Spinner } from "@heroui/react"
import Link from "next/link"

/**
 * Render the dashboard UI: show a centered loading spinner while authentication data is missing, and show a greeting with the authenticated user's email and a sign-out link when available.
 *
 * @returns A React element containing either a centered Spinner while authentication is pending or a greeting with the user's email and a sign-out link.
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