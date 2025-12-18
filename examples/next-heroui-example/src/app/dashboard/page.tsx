"use client"

import { useAuthenticate } from "@better-auth-ui/heroui/react"
import { Spinner } from "@heroui/react"
import Link from "next/link"

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
