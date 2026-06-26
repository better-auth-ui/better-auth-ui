import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { Key } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { type SyntheticEvent, useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"

import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
}

export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  organizationId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey(
    authClient as ApiKeyAuthClient
  )

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(open)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()

    const payload =
      name || organizationId
        ? {
            ...(name ? { name } : {}),
            ...(organizationId
              ? { organizationId, configId: "organization" }
              : {})
          }
        : undefined

    createApiKey(payload, {
      onSuccess: (result) => {
        handleOpenChange(false)
        setKeyName(name)
        setSecretKey(result.key)
        setIsNewKeyDialogOpen(true)
      }
    })
  }

  return (
    <>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <Form onSubmit={handleSubmit}>
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status="default">
                  <Key />
                </AlertDialog.Icon>

                <AlertDialog.Heading>
                  {apiKeyLocalization.createApiKey}
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body className="overflow-visible">
                <p className="text-muted text-sm">
                  {apiKeyLocalization.apiKeysDescription}
                </p>

                <TextField
                  className="mt-4"
                  id="name"
                  name="name"
                  isDisabled={isCreating}
                >
                  <Label>{apiKeyLocalization.name}</Label>

                  <Input
                    autoFocus
                    placeholder={localization.settings.optional}
                    variant="secondary"
                  />

                  <FieldError />
                </TextField>
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isCreating}>
                  {localization.settings.cancel}
                </Button>

                <Button type="submit" isPending={isCreating}>
                  {isCreating && <Spinner color="current" size="sm" />}

                  {apiKeyLocalization.createApiKey}
                </Button>
              </AlertDialog.Footer>
            </Form>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <NewApiKeyDialog
        isOpen={isNewKeyDialogOpen}
        onOpenChange={setIsNewKeyDialogOpen}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}
