import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeleteApiKey } from "@better-auth-ui/react/plugins/api-key"
import { Key } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"

export type DeleteApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  apiKey: ListedApiKey
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string
}

export function DeleteApiKeyDialog({
  isOpen,
  onOpenChange,
  apiKey,
  organizationId
}: DeleteApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const preview = `${apiKey.start}${"*".repeat(16)}`
  const { mutate: deleteApiKey, isPending: isDeleting } = useDeleteApiKey(
    authClient as ApiKeyAuthClient,
    {
      onSuccess: () => onOpenChange(false)
    }
  )

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <Key />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {apiKeyLocalization.deleteApiKey}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
            <p className="text-muted text-sm">
              {apiKeyLocalization.deleteApiKeyWarning}
            </p>

            <TextField
              value={preview}
              className="font-mono text-xs"
              variant="secondary"
            >
              <Label>{apiKey.name || apiKeyLocalization.apiKey}</Label>

              <Input readOnly className="font-mono text-xs" />
            </TextField>
          </AlertDialog.Body>

          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isDeleting}>
              {localization.settings.cancel}
            </Button>

            <Button
              variant="danger"
              onPress={() =>
                deleteApiKey({
                  keyId: apiKey.id,
                  ...(organizationId ? { configId: "organization" } : {})
                })
              }
              isPending={isDeleting}
            >
              {isDeleting && <Spinner color="current" size="sm" />}

              {apiKeyLocalization.deleteApiKey}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
