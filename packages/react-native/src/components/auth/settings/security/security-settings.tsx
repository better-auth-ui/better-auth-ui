import { useAuth } from "@better-auth-ui/react"
import { View } from "react-native"
import { cn } from "../../../../lib/cn"
import type { CardVariant } from "../../../../primitives/card"
import { ActiveSessions } from "./active-sessions"
import { ChangePassword } from "./change-password"
import { LinkedAccounts } from "./linked-accounts"

export type SecuritySettingsProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Renders the security settings layout including password management, linked accounts, and active sessions.
 *
 * ChangePassword is rendered when password authentication is enabled; LinkedAccounts is rendered when social providers are present.
 * Each registered auth plugin may contribute `securityCards` (for example delete-user, passkeys).
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param variant - Card variant forwarded to each security settings card.
 * @returns The security settings container as a JSX element.
 */
export function SecuritySettings({
  className,
  variant
}: SecuritySettingsProps) {
  const { emailAndPassword, plugins, socialProviders } = useAuth()

  return (
    <View className={cn("w-full flex-col gap-4", className)}>
      {emailAndPassword?.enabled && <ChangePassword variant={variant} />}
      {!!socialProviders?.length && <LinkedAccounts variant={variant} />}
      <ActiveSessions variant={variant} />
      {plugins.flatMap((plugin) =>
        plugin.securityCards?.map((Card, index) => (
          <Card key={`${plugin.id}-${index.toString()}`} variant={variant} />
        ))
      )}
    </View>
  )
}
