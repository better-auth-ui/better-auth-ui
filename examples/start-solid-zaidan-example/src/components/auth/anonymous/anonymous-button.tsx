import { authMutationKeys } from "@better-auth-ui/core"
import {
  type AnonymousAuthClient,
  signInAnonymousOptions,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { createMutation, useIsMutating } from "@tanstack/solid-query"
import { UserRound } from "lucide-solid"
import { Show } from "solid-js"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { anonymousPlugin } from "@/lib/auth/anonymous-plugin"
import { cn } from "@/lib/utils"

/** Sign in with a temporary anonymous account. */
export function AnonymousButton() {
  const auth = useAuth()
  const { localization } = useAuthPlugin(anonymousPlugin)
  const signInAnonymous = createMutation(() => ({
    ...signInAnonymousOptions(auth.authClient as AnonymousAuthClient),
    onSuccess: () => auth.navigate({ to: auth.redirectTo })
  }))

  const signInMutating = useIsMutating(() => ({
    mutationKey: authMutationKeys.signIn.all
  }))
  const signUpMutating = useIsMutating(() => ({
    mutationKey: authMutationKeys.signUp.all
  }))
  const isPending = () => signInMutating() + signUpMutating() > 0

  return (
    <Button
      class={cn("w-full", isPending() && "pointer-events-none")}
      disabled={isPending()}
      onClick={() => signInAnonymous.mutate(undefined)}
      type="button"
      variant="outline"
    >
      <Show
        fallback={<UserRound data-icon="inline-start" />}
        when={signInAnonymous.isPending}
      >
        <Spinner data-icon="inline-start" />
      </Show>
      {localization.continueAsGuest}
    </Button>
  )
}
