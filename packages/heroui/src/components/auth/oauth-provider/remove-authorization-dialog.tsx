"use client"

import type {
  AuthorizedOAuthApplication,
  OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteOAuthConsent } from "@better-auth-ui/react/plugins/oauth-provider"
import { ShieldExclamation } from "@gravity-ui/icons"
import { AlertDialog, Button, Spinner } from "@heroui/react"
import { useState, type JSX } from "react"

import { oauthProviderPlugin } from "@better-auth-ui/core/plugins/oauth-provider"

export type RemoveAuthorizationDialogProps = {
  /** @remarks `AuthorizedOAuthApplication` */
  application: AuthorizedOAuthApplication
  clientName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmation for removing every consent record tied to one OAuth client.
 *
 * The copy is deliberate: Better Auth's consent deletion removes the stored
 * approval, so the application must ask again — it does not revoke access or
 * refresh tokens that were already issued.
 */
export function RemoveAuthorizationDialog({
  application,
  clientName,
  isOpen,
  onOpenChange
}: RemoveAuthorizationDialogProps): JSX.Element {
  const { authClient, localization } = useAuth<OAuthProviderAuthClient>()
  const { localization: oauthLocalization } = useAuthPlugin(oauthProviderPlugin)
  const [isRemoving, setIsRemoving] = useState(false)

  const { mutateAsync: deleteConsent } = useDeleteOAuthConsent(authClient)

  const removeAuthorization = async () => {
    setIsRemoving(true)

    try {
      // Sequential so a mid-list failure leaves a predictable server state
      // that the refetched list reflects accurately.
      for (const id of application.consentIds) {
        await deleteConsent({ id })
      }

      onOpenChange(false)
    } catch {
      // The error toaster reports the failure; the dialog stays open so the
      // remaining records can be retried.
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <ShieldExclamation />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {oauthLocalization.removeAuthorizationTitle}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-4">
            <p className="text-muted text-sm">
              {oauthLocalization.removeAuthorizationDescription}
            </p>

            <p className="text-sm font-medium">{clientName}</p>
          </AlertDialog.Body>

          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isRemoving}>
              {localization.settings.cancel}
            </Button>

            <Button
              variant="danger"
              isPending={isRemoving}
              onPress={() => void removeAuthorization()}
            >
              {isRemoving && <Spinner color="current" size="sm" />}

              {oauthLocalization.remove}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
