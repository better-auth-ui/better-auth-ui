import { authMutationKeys } from "@better-auth-ui/core"
import type { AnonymousAuthClient } from "@better-auth-ui/core/plugins/anonymous"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInAnonymous } from "@better-auth-ui/react/plugins/anonymous"
import { useIsMutating } from "@tanstack/react-query"
import { anonymousPlugin } from "../../../lib/auth/anonymous-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { Button } from "../../../primitives/button"

export function AnonymousButton() {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(anonymousPlugin)
  const onSuccess = useSignInContinuation()
  const mutation = useSignInAnonymous(authClient as AnonymousAuthClient, {
    onSuccess
  })
  const signInPending = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpPending = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  return (
    <Button
      onPress={() => mutation.mutate()}
      isPending={mutation.isPending}
      isDisabled={signInPending + signUpPending > 0}
    >
      {localization.continueAsGuest}
    </Button>
  )
}
