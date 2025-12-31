import { UserButton } from "@better-auth-ui/heroui"
import { Link } from "@heroui/react"
import { Suspense } from "react"

import { Logo } from "./logo"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background shadow-xs border-b border-default">
      <div className="py-3 px-4 md:px-6 mx-auto justify-between flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded"
          underline="none"
        >
          <Logo />

          <h1 className="text-base">BETTER-AUTH. UI</h1>
        </Link>

        <Suspense>
          <UserButton size="icon" placement="bottom right" />
        </Suspense>
      </div>
    </header>
  )
}
