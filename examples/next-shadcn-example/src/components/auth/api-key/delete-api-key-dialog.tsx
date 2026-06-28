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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
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
          <Label htmlFor={previewId}>
            {apiKey.name || apiKeyLocalization.apiKey}
          </Label>

          <Input
            id={previewId}
            value={preview}
            readOnly
            className="font-mono text-xs"
            disabled
          />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {localization.settings.cancel}
          </AlertDialogCancel>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() =>
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
      </AlertDialogContent>
    </AlertDialog>
  )
}
