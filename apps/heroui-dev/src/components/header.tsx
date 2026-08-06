import { UserButton } from "@better-auth-ui/heroui"
import { OrganizationSwitcher } from "@better-auth-ui/heroui/plugins/organization"
import { Link } from "@heroui/react"

import { Logo } from "./logo"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="py-3 px-4 md:px-6 mx-auto justify-between flex items-center">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Logo />

          <h1 className="sm:text-base truncate">BETTER-AUTH. UI</h1>
        </Link>

        <div className="flex items-center gap-2">
          <OrganizationSwitcher placement="bottom end" />

          <UserButton size="icon" placement="bottom end" />
        </div>
      </div>
    </header>
  )
}
