import type {
  AuthorizedOAuthApplication,
  OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useDeleteOAuthConsent } from "@better-auth-ui/solid/plugins/oauth-provider"
import { ShieldOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"

import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"

export type RemoveAuthorizationDialogProps = {
  /** @remarks `AuthorizedOAuthApplication` */
  application: AuthorizedOAuthApplication
  clientName: string
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmation for removing every consent record tied to one OAuth client.
 *
 * The copy is deliberate: Better Auth's consent deletion removes the stored
 * approval, so the application must ask again — it does not revoke access or
 * refresh tokens that were already issued.
 */
export function RemoveAuthorizationDialog(
  props: RemoveAuthorizationDialogProps
) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const [isRemoving, setIsRemoving] = createSignal(false)

  const deleteConsent = useDeleteOAuthConsent(
    auth.authClient as OAuthProviderAuthClient
  )

  const removeAuthorization = async () => {
    setIsRemoving(true)

    try {
      // Sequential so a mid-list failure leaves a predictable server state
      // that the refetched list reflects accurately.
      for (const id of props.application.consentIds) {
        await deleteConsent.mutateAsync({ id })
      }

      props.onOpenChange(false)
    } catch {
      // The error toaster reports the failure; the dialog stays open so the
      // remaining records can be retried.
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <ShieldOff />
        </AlertDialogMedia>
        <AlertDialogTitle>
          {localization.removeAuthorizationTitle}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {localization.removeAuthorizationDescription}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <p class="font-medium text-sm">{props.clientName}</p>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isRemoving()} type="button">
          {auth.localization.settings.cancel}
        </AlertDialogCancel>

        <Button
          disabled={isRemoving()}
          type="button"
          variant="destructive"
          onClick={removeAuthorization}
        >
          <Show when={isRemoving()}>
            <Spinner />
          </Show>
          {localization.remove}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
