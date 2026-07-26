import type { AuthorizedOAuthApplication } from "@better-auth-ui/core/plugins"
import {
  deleteOAuthConsentOptions,
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { ShieldOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
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

  const deleteConsent = createMutation(() =>
    deleteOAuthConsentOptions(auth.authClient as OAuthProviderAuthClient)
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
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <ShieldOff class="size-4.5" />
        </div>
        <DialogTitle>{localization.removeAuthorizationTitle}</DialogTitle>
        <DialogDescription>
          {localization.removeAuthorizationDescription}
        </DialogDescription>
      </DialogHeader>

      <p class="font-medium text-sm">{props.clientName}</p>

      <DialogFooter>
        <DialogClose
          as={Button}
          disabled={isRemoving()}
          type="button"
          variant="outline"
        >
          {auth.localization.settings.cancel}
        </DialogClose>

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
      </DialogFooter>
    </DialogContent>
  )
}
