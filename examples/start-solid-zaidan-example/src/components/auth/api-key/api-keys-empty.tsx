import { apiKeyLocalization } from "@better-auth-ui/core/plugins"
import { Key } from "lucide-solid"
import { Button } from "@/components/ui/button"

export function ApiKeysEmpty(props: { onCreatePress: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div class="flex size-10 items-center justify-center rounded-md bg-muted">
        <Key class="size-4.5" />
      </div>

      <div class="flex flex-col items-center justify-center gap-1">
        <p class="font-semibold text-sm">{apiKeyLocalization.noApiKeys}</p>
        <p class="text-muted-foreground text-xs">
          {apiKeyLocalization.apiKeysDescription}
        </p>
      </div>

      <Button onClick={props.onCreatePress} size="sm" type="button">
        {apiKeyLocalization.createApiKey}
      </Button>
    </div>
  )
}
