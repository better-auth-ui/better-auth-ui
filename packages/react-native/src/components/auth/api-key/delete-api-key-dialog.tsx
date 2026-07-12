import {
  type ApiKeyAuthClient,
  type ListedApiKey,
  useAuth,
  useAuthPlugin,
  useDeleteApiKey
} from "@better-auth-ui/react"
import { Text } from "react-native"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Label, TextField } from "../../../primitives/field"
import { InputGroup } from "../../../primitives/input"
import { Key } from "../../../primitives/ui-icons"

export type DeleteApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  apiKey: ListedApiKey
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string
}

/**
 * Danger confirm dialog for deleting an API key. Mirrors the heroui
 * `DeleteApiKeyDialog`, adapted for React Native: the masked key preview is
 * rendered as static `Text` inside an `InputGroup` (RN's `Input` is always an
 * editable, field-bound `TextInput`, so there is no `readOnly` prop to mirror
 * — matches the `NewApiKeyDialog` reveal-field pattern) and the root
 * `AlertDialog` collapses heroui's `Backdrop`/`Container`/`Dialog` nesting
 * into a single controlled `Modal`.
 */
export function DeleteApiKeyDialog({
  isOpen,
  onOpenChange,
  apiKey,
  organizationId
}: DeleteApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const colors = useThemeColors()
  const preview = `${apiKey.start}${"*".repeat(16)}`
  const { mutate: deleteApiKey, isPending: isDeleting } = useDeleteApiKey(
    authClient as ApiKeyAuthClient,
    {
      onSuccess: () => onOpenChange(false)
    }
  )

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="danger">
          <Key width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {apiKeyLocalization.deleteApiKey}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Text className="text-sm text-muted">
          {apiKeyLocalization.deleteApiKeyWarning}
        </Text>

        <TextField value={preview} isDisabled className="gap-1.5">
          <Label>{apiKey.name || apiKeyLocalization.apiKey}</Label>

          <InputGroup>
            <Text
              className="flex-1 font-mono text-xs text-foreground"
              numberOfLines={1}
            >
              {preview}
            </Text>
          </InputGroup>
        </TextField>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button
          variant="tertiary"
          isDisabled={isDeleting}
          onPress={() => onOpenChange(false)}
        >
          {localization.settings.cancel}
        </Button>

        <Button
          variant="danger"
          isPending={isDeleting}
          onPress={() =>
            deleteApiKey({
              keyId: apiKey.id,
              ...(organizationId ? { configId: "organization" } : {})
            })
          }
        >
          {apiKeyLocalization.deleteApiKey}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}
