"use client"
import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteApiKey } from "@better-auth-ui/react/plugins/api-key"
import { Key } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
export type DeleteApiKeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: ListedApiKey
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string
}
export function DeleteApiKeyDialog({
  open,
  onOpenChange,
  apiKey,
  organizationId
}: DeleteApiKeyDialogProps) {
  const { authClient, localization } = useAuth<ApiKeyAuthClient>()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const preview = `${apiKey.start}${"*".repeat(16)}`
  const previewId = `delete-api-key-preview-${apiKey.id}`
  const { mutate: deleteApiKey, isPending: isDeleting } = useDeleteApiKey(
    authClient,
    {
      onSuccess: () => onOpenChange(false)
    }
  )
  return (
    <AlertDialog isOpen={open} onOpenChange={onOpenChange}>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <Key />
        </AlertDialogMedia>

        <AlertDialogTitle>{apiKeyLocalization.deleteApiKey}</AlertDialogTitle>

        <AlertDialogDescription>
          {apiKeyLocalization.deleteApiKeyWarning}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Field>
        <FieldLabel htmlFor={previewId} id={`${previewId}-label`}>
          {apiKey.name || apiKeyLocalization.apiKey}
        </FieldLabel>

        <Input
          id={previewId}
          value={preview}
          readOnly
          className="font-mono text-xs"
          disabled
        />
      </Field>

      <AlertDialogFooter>
        <AlertDialogCancel isDisabled={isDeleting}>
          {localization.settings.cancel}
        </AlertDialogCancel>

        <Button
          type="button"
          variant="destructive"
          isDisabled={isDeleting}
          onPress={() =>
            deleteApiKey({
              keyId: apiKey.id,
              ...(organizationId ? { configId: "organization" } : {})
            })
          }
        >
          {isDeleting && <Spinner />}

          {apiKeyLocalization.deleteApiKey}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  )
}
