import Link from "next/link"

/**
 * Render the landing page with a centered title and a sign-in link.
 *
 * @returns A React element containing a vertically centered "Hello World" heading and a `Link` to `/auth/sign-in` styled as an underlined blue link.
 */
export default function Home() {
  return (
    <div className="min-h-svh flex items-center justify-center flex-col gap-4">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <Link
        href="/auth/sign-in"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Sign In
      </Link>
    </div>
  )
}
