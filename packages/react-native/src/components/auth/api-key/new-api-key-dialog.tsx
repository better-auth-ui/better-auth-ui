import { apiKeyPlugin } from "@better-auth-ui/core/plugins"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useState } from "react"
import { copyText } from "../../../lib/clipboard"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Label, TextField } from "../../../primitives/field"
import { InputGroup } from "../../../primitives/input"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { Check, Copy, Key } from "../../../primitives/ui-icons"

export type NewApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  name: string | null
  secretKey: string | null
}

/**
 * "Copy your key now" reveal dialog shown right after an API key is created.
 * Mirrors heroui's `NewApiKeyDialog`, adapted for React Native: the secret is
 * displayed as read-only text (RN's `InputGroup.Input` always binds to an
 * editable `TextInput`, so a masked/static `Text` row stands in for it) and
 * copying uses the RN clipboard helper + a success toast instead of the web
 * `navigator.clipboard` call + a 1.5s copied-icon flip.
 */
export function NewApiKeyDialog({
  isOpen,
  onOpenChange,
  name,
  secretKey
}: NewApiKeyDialogProps) {
  const { localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const colors = useThemeColors()

  const [copied, setCopied] = useState(false)

  const copySecretKey = async () => {
    if (!secretKey) return

    try {
      await copyText(secretKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="warning">
          <Key width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {apiKeyLocalization.newApiKey}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Txt className="text-sm text-muted">
          {apiKeyLocalization.newApiKeyWarning}
        </Txt>

        <TextField value={secretKey ?? ""} className="gap-1.5">
          <Label>{name || apiKeyLocalization.apiKey}</Label>

          <InputGroup>
            <Box className="h-full flex-1 justify-center">
              <Txt
                className="font-mono text-xs text-foreground"
                numberOfLines={1}
              >
                {secretKey ?? ""}
              </Txt>
            </Box>

            <InputGroup.Suffix className="px-0">
              <Button
                isIconOnly
                aria-label={localization.settings.copyToClipboard}
                size="sm"
                variant="ghost"
                onPress={copySecretKey}
              >
                {copied ? (
                  <Check width={16} height={16} color={colors.muted} />
                ) : (
                  <Copy width={16} height={16} color={colors.muted} />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button variant="tertiary" onPress={() => onOpenChange(false)}>
          {apiKeyLocalization.dismissNewKey}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}
