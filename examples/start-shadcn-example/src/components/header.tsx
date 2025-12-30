import { UserButton } from "@better-auth-ui/shadcn"
import { Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { Logo } from "./logo"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background border-b shadow-xs">
      <div className="py-3 px-4 md:px-6 mx-auto justify-between flex items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />

          <h1 className="text-base">BETTER-AUTH. UI</h1>
        </Link>

        <Suspense>
          <UserButton size="icon" align="end" />
        </Suspense>
      </div>
    </header>
  )
}
