import { UserButton } from "@better-auth-ui/shadcn"
import { Link } from "@tanstack/react-router"

import { Logo } from "./logo"

export function Header() {
  return (
    <header className="py-2 px-4 md:px-6 bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto justify-between flex">
        <Link to="/" className="flex items-center gap-3">
          <Logo />

          <h1 className="text-lg font-bold">Better Auth UI</h1>
        </Link>

        <UserButton size="icon" />
      </div>
    </header>
  )
}
