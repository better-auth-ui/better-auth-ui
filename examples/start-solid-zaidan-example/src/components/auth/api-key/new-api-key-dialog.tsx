import { apiKeyLocalization } from "@better-auth-ui/core/plugins"
import { createCopyToClipboard, useAuth } from "@better-auth-ui/solid"
import { Check, Copy, Key } from "lucide-solid"
import { createEffect, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"

export function NewApiKeyDialog(props: {
  name: string | null
  onDismiss: () => void
  open: boolean
  secretKey: string | null
}) {
  const auth = useAuth()
  const {
    copied: isCopied,
    copy,
    reset
  } = createCopyToClipboard({
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : String(error))
  })

  createEffect(() => {
    if (!props.open) {
      reset()
    }
  })

  const handleDismiss = () => {
    reset()
    props.onDismiss()
  }

  const copySecretKey = async () => {
    if (!props.secretKey) return

    await copy(props.secretKey)
  }

  return (
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Key class="size-4.5" />
        </div>
        <DialogTitle>{apiKeyLocalization.newApiKey}</DialogTitle>
        <DialogDescription>
          {apiKeyLocalization.newApiKeyWarning}
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel for="new-api-key-secret">
          {props.name || apiKeyLocalization.apiKey}
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            class="font-mono text-xs"
            id="new-api-key-secret"
            readonly
            value={props.secretKey ?? ""}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={
                isCopied()
                  ? auth.localization.settings.copiedToClipboard
                  : auth.localization.settings.copyToClipboard
              }
              onClick={copySecretKey}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <Show fallback={<Copy />} when={isCopied()}>
                <Check />
              </Show>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <DialogFooter>
        <Button onClick={handleDismiss} type="button">
          {apiKeyLocalization.dismissNewKey}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
