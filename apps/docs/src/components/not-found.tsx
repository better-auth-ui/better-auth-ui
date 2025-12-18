import { Link } from "@tanstack/react-router"
import { HomeLayout } from "fumadocs-ui/layouts/home"

/**
 * Render a 404 Not Found page wrapped in the HomeLayout.
 *
 * @returns A JSX element containing a prominent "404" heading, a "Page Not Found" subtitle, explanatory text, and a link that navigates back to the site's home ("/").
 */
export function NotFound() {
  return (
    <HomeLayout
      nav={{
        title: "Tanstack Start"
      }}
    >
      <div className="flex flex-col gap-4 justify-center items-center grow">
        <h1 className="text-6xl font-bold text-fd-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-fd-muted-foreground max-w-md">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </HomeLayout>
  )
}
