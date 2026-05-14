import { useAuth } from "@better-auth-ui/solid"
import { onMount } from "solid-js"
import { cn } from "@/lib/utils"

export type SignOutProps = {
  class?: string
  label?: string
}

const signInHref = (basePath: string, signInPath: string) =>
  `${basePath}/${signInPath}`

export function SignOut(props: SignOutProps) {
  const auth = useAuth()
  let hasRequestedSignOut = false

  onMount(async () => {
    if (hasRequestedSignOut) return
    hasRequestedSignOut = true

    try {
      await auth.authClient.signOut({ fetchOptions: { throw: true } })
    } finally {
      auth.navigate({
        to: signInHref(auth.basePaths.auth, auth.viewPaths.auth.signIn),
        replace: true
      })
    }
  })

  return (
    <section
      aria-label="Signing out"
      aria-live="polite"
      class={cn(props.class)}
      role="status"
    >
      <h1>Signing out</h1>
      <p>{props.label ?? "Ending your session…"}</p>
    </section>
  )
}
