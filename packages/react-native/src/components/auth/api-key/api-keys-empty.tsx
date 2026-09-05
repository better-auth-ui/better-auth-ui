import { useAuthPlugin } from "@better-auth-ui/react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { Button } from "../../../primitives/button"
import { EmptyState } from "../../../primitives/tabs"
import { Key } from "../../../primitives/ui-icons"

export type ApiKeysEmptyProps = {
  onCreatePress: () => void
  /** Hide the empty-state "Create API key" button. */
  hideCreate?: boolean
}

/**
 * Empty state for the API keys list. Mirrors the heroui `ApiKeysEmpty`,
 * adapted for React Native: the icon chip + title/description + optional
 * create button are composed via the `EmptyState` primitive instead of
 * raw `div`/`p` markup, and the gravity-ui `Key` icon becomes RN's
 * `react-native-svg` `Key`.
 */
export function ApiKeysEmpty({ onCreatePress, hideCreate }: ApiKeysEmptyProps) {
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  return (
    <EmptyState
      icon={<Key width={18} height={18} />}
      title={apiKeyLocalization.noApiKeys}
      description={apiKeyLocalization.apiKeysDescription}
      action={
        !hideCreate && (
          <Button size="sm" onPress={onCreatePress}>
            {apiKeyLocalization.createApiKey}
          </Button>
        )
      }
    />
  )
}
