import Link from "next/link"

/**
 * Renders the home page with a centered greeting and a link to the sign-in page.
 *
 * @returns The component's JSX: a centered container with a "Hello World" heading and a "Sign In" link to `/auth/sign-in`.
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