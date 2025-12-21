import { UserButton } from "@better-auth-ui/heroui"
import { Link } from "@heroui/react"
import { Logo } from "./logo"

export function Header() {
  return (
    <header className="py-2 px-4 md:px-6 bg-surface shadow-xs sticky top-0 z-10">
      <div className="container mx-auto justify-between flex items-center">
        <Link
          href="/"
          className="flex items-center gap-3 rounded"
          underline="none"
        >
          <Logo />

          <h1 className="text-base">BETTER-AUTH. UI</h1>
        </Link>

        <UserButton size="icon" placement="bottom right" />
      </div>
    </header>
  )
}
