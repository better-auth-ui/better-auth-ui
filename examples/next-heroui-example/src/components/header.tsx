import { ensureSessionServer as ensureSession } from "@better-auth-ui/core/server"
import { UserButton } from "@better-auth-ui/heroui"
import { Link } from "@heroui/react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getQueryClient } from "@/lib/query-client"
import { Logo } from "./logo"

export async function Header() {
  const requestHeaders = await headers()
  const queryClient = getQueryClient()

  await ensureSession(queryClient, auth, { headers: requestHeaders })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="py-3 px-4 md:px-6 mx-auto justify-between flex items-center">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Logo />

            <h1 className="text-base">BETTER-AUTH. UI</h1>
          </Link>

          <UserButton size="icon" placement="bottom right" />
        </div>
      </header>
    </HydrationBoundary>
  )
}
