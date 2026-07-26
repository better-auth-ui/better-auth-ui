"use client"

import type {
  AuthorizedOAuthApplication,
  OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteOAuthConsent } from "@better-auth-ui/react/plugins/oauth-provider"
import { ShieldOff } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
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
  open: boolean
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
  open,
  onOpenChange
}: RemoveAuthorizationDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: oauthLocalization } = useAuthPlugin(oauthProviderPlugin)
  const [isRemoving, setIsRemoving] = useState(false)

  const { mutateAsync: deleteConsent } = useDeleteOAuthConsent(
    authClient as OAuthProviderAuthClient
  )

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <ShieldOff />
          </AlertDialogMedia>

          <AlertDialogTitle>
            {oauthLocalization.removeAuthorizationTitle}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {oauthLocalization.removeAuthorizationDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p className="text-sm font-medium">{clientName}</p>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>
            {localization.settings.cancel}
          </AlertDialogCancel>

          <Button
            type="button"
            variant="destructive"
            disabled={isRemoving}
            onClick={removeAuthorization}
          >
            {isRemoving && <Spinner />}

            {oauthLocalization.remove}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
