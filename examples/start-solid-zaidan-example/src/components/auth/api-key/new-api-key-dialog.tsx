import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { useAuth } from "@better-auth-ui/solid"
import { Check, Copy, Key } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function NewApiKeyDialog(props: {
  name: string | null
  secretKey: string | null
}) {
  const auth = useAuth()
  const [isCopied, setIsCopied] = createSignal(false)

  const copySecretKey = async () => {
    if (!props.secretKey) return

    try {
      await navigator.clipboard.writeText(props.secretKey)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Key class="size-4.5" />
        </div>
        <DialogTitle>{apiKeyLocalization.newApiKey}</DialogTitle>
        <DialogDescription>
          {apiKeyLocalization.newApiKeyWarning}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-2">
        <Label for="new-api-key-secret">
          {props.name || apiKeyLocalization.apiKey}
        </Label>
        <div class="flex rounded-md border bg-background">
          <Input
            class="rounded-r-none border-0 font-mono text-xs"
            id="new-api-key-secret"
            readonly
            value={props.secretKey ?? ""}
          />
          <Button
            aria-label={auth.localization.settings.copyToClipboard}
            onClick={copySecretKey}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <Show fallback={<Copy />} when={isCopied()}>
              <Check />
            </Show>
          </Button>
        </div>
      </div>

      <DialogFooter>
        <DialogClose as={Button}>
          {apiKeyLocalization.dismissNewKey}
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
