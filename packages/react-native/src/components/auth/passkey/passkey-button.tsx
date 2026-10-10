import { authMutationKeys } from "@better-auth-ui/core"
import { useAuthPlugin, type AuthButtonProps } from "@better-auth-ui/react"
import { useSignInPasskey } from "@better-auth-ui/react/plugins/passkey"
import { useIsMutating } from "@tanstack/react-query"
import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { Button } from "../../../primitives/button"
import { LastUsedBadge } from "../last-login-method/last-used-badge"

export function PasskeyButton(props: AuthButtonProps) {
  const { client, localization } = useAuthPlugin(passkeyPlugin)
  const continueSignIn = useSignInContinuation()
  const signIn = useSignInPasskey(client, {
    onSuccess: (result) => continueSignIn(result.data)
  })
  const pending =
    useIsMutating({ mutationKey: authMutationKeys.signIn.all }) +
      useIsMutating({ mutationKey: authMutationKeys.signUp.all }) >
    0
  return (
    <Button
      className={props.className}
      isPending={signIn.isPending}
      isDisabled={pending}
      onPress={() => signIn.mutate({ autoFill: false })}
    >
      {localization.passkey}
      <LastUsedBadge method="passkey" />
    </Button>
  )
}
