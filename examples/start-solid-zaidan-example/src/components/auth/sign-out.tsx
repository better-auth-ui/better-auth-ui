import { useAuth } from "@better-auth-ui/solid"
import { onMount } from "solid-js"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "cn"

export type SignOutProps = {
  class?: string
}

const signInHref = (basePath: string, signInPath: string) =>
  `${basePath}/${signInPath}`

export function SignOut(props: SignOutProps) {
  const auth = useAuth()
  let hasRequestedSignOut = false

  onMount(() => {
    if (hasRequestedSignOut) return
    hasRequestedSignOut = true

    const signOut = auth.authClient.signOut({ fetchOptions: { throw: true } })

    void signOut
      .catch((error: unknown) => {
        console.error("[Better Auth UI] Sign out failed", error)
      })
      .finally(() => {
        auth.navigate({
          to: signInHref(auth.basePaths.auth, auth.viewPaths.auth.signIn),
          replace: true
        })
      })
  })

  return <Spinner class={cn("mx-auto my-auto", props.class)} />
}
