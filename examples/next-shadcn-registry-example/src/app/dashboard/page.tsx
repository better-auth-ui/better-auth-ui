"use client"

import { Spinner } from "@heroui/react"
import Link from "next/link"

import { useAuthenticate } from "@/hooks/auth/use-authenticate"

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
