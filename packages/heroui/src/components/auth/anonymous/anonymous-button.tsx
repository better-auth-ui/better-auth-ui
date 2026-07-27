import { authMutationKeys } from "@better-auth-ui/core"
import type { AnonymousAuthClient } from "@better-auth-ui/core/plugins/anonymous"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInAnonymous } from "@better-auth-ui/react/plugins/anonymous"
import { Person } from "@gravity-ui/icons"
import { Button, Spinner } from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"

import { anonymousPlugin } from "../../../lib/auth/anonymous-plugin"

/** Sign in with a temporary anonymous account. */
export function AnonymousButton() {
  const { authClient, navigate, redirectTo } = useAuth()
  const { localization } = useAuthPlugin(anonymousPlugin)
  const { mutate: signInAnonymous, isPending: anonymousPending } =
    useSignInAnonymous(authClient as AnonymousAuthClient, {
      onSuccess: () => navigate({ to: redirectTo })
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  return (
    <Button
      className="w-full"
      variant="tertiary"
      isDisabled={isPending}
      isPending={anonymousPending}
      onPress={() => signInAnonymous()}
    >
      {anonymousPending ? <Spinner color="current" size="sm" /> : <Person />}
      {localization.continueAsGuest}
    </Button>
  )
}
