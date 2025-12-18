import Link from "next/link"

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
