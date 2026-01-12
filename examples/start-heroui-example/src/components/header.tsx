import { UserButton } from "@better-auth-ui/heroui"
import { Link } from "@heroui/react"
import { Logo } from "./logo"

/**
 * Render the application header containing the brand link and user account button.
 *
 * The header is a top-aligned bar that displays the application logo and title on the left
 * and a user control button on the right.
 *
 * @returns The header JSX element containing the logo/title link and a user button.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-default">
      <div className="py-3 px-4 md:px-6 mx-auto justify-between flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded"
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
