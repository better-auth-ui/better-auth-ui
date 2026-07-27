import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { Key } from "lucide-solid"
import { Show } from "solid-js"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

export function ApiKeysEmpty(props: {
  hideCreate?: boolean
  onCreatePress: () => void
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Key />
        </EmptyMedia>
        <EmptyTitle>{apiKeyLocalization.noApiKeys}</EmptyTitle>
        <EmptyDescription>
          {apiKeyLocalization.apiKeysDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Show when={!props.hideCreate}>
          <Button onClick={props.onCreatePress} size="sm" type="button">
            {apiKeyLocalization.createApiKey}
          </Button>
        </Show>
      </EmptyContent>
    </Empty>
  )
}
