import {
  type ApiKeyAuthClient,
  useAuth,
  useAuthPlugin,
  useCreateApiKey
} from "@better-auth-ui/react"
import { useState } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { Form } from "../../../primitives/form"
import { Input } from "../../../primitives/input"
import { Txt } from "../../../primitives/styled"
import { Key } from "../../../primitives/ui-icons"
import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
}

/**
 * Alert-dialog form for creating an API key: optional `name` field →
 * `useCreateApiKey` → on success opens `NewApiKeyDialog` with the returned
 * secret. Mirrors the heroui `CreateApiKeyDialog`, adapted for React Native:
 * the `name` field is controlled state (no `FormData`) and submission goes
 * through the `Form` coordinator's `onSubmit` instead of a form `submit`
 * event.
 */
export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  organizationId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const colors = useThemeColors()

  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey(
    authClient as ApiKeyAuthClient
  )

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const [name, setName] = useState("")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("")
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(open)
  }

  const handleSubmit = () => {
    const trimmedName = name.trim()

    const payload =
      trimmedName || organizationId
        ? {
            ...(trimmedName ? { name: trimmedName } : {}),
            ...(organizationId
              ? { organizationId, configId: "organization" }
              : {})
          }
        : undefined

    createApiKey(payload, {
      onSuccess: (result) => {
        handleOpenChange(false)
        setKeyName(trimmedName)
        setSecretKey(result.key)
        setIsNewKeyDialogOpen(true)
      }
    })
  }

  return (
    <>
      <AlertDialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Form onSubmit={handleSubmit}>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="default">
              <Key width={20} height={20} color={colors.foreground} />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {apiKeyLocalization.createApiKey}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body>
            <Txt className="text-sm text-muted">
              {apiKeyLocalization.apiKeysDescription}
            </Txt>

            <TextField
              className="mt-4"
              name="name"
              isDisabled={isCreating}
              value={name}
              onChange={setName}
            >
              <Label>{apiKeyLocalization.name}</Label>

              <Input
                placeholder={localization.settings.optional}
                variant="secondary"
              />

              <FieldError />
            </TextField>
          </AlertDialog.Body>

          <AlertDialog.Footer>
            <Button
              variant="tertiary"
              isDisabled={isCreating}
              onPress={() => handleOpenChange(false)}
            >
              {localization.settings.cancel}
            </Button>

            <Button type="submit" isPending={isCreating}>
              {apiKeyLocalization.createApiKey}
            </Button>
          </AlertDialog.Footer>
        </Form>
      </AlertDialog>

      <NewApiKeyDialog
        isOpen={isNewKeyDialogOpen}
        onOpenChange={setIsNewKeyDialogOpen}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}
