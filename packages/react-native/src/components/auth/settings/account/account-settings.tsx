import { useAuth } from "@better-auth-ui/react"
import { View } from "react-native"
import type { SettingsViewProps } from "../../../../lib/auth-plugin"
import { cn } from "../../../../lib/cn"
import { ChangeEmail } from "./change-email"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = SettingsViewProps

/**
 * Renders the account settings layout.
 *
 * `UserProfile` always renders. `ChangeEmail` renders when password auth is
 * enabled or the `magicLink` plugin is registered. Plugin-contributed account
 * cards (e.g. `Appearance` from the theme plugin, multi-session accounts) are
 * rendered via the plugins array.
 *
 * @param className - Optional additional class names for the outer container.
 * @param variant - Card variant forwarded to each account settings card.
 * @returns The account settings container as a JSX element.
 */
export function AccountSettings({ className, variant }: AccountSettingsProps) {
  const { emailAndPassword, plugins } = useAuth()

  const hasMagicLink = plugins.some((plugin) => plugin.id === "magicLink")

  return (
    <View className={cn("flex w-full flex-col gap-4", className)}>
      <UserProfile variant={variant} />
      {(emailAndPassword?.enabled || hasMagicLink) && (
        <ChangeEmail variant={variant} />
      )}
      {plugins.flatMap((plugin) =>
        plugin.accountCards?.map((Card, index) => (
          <Card key={`${plugin.id}-${index.toString()}`} variant={variant} />
        ))
      )}
    </View>
  )
}
