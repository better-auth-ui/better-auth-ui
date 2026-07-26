import { useAuth } from "@better-auth-ui/react"
import { type CardProps, cn } from "@heroui/react"
import type { ComponentProps } from "react"

import { ChangeEmail } from "./change-email"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders the account settings layout.
 *
 * `UserProfile` always renders. The change-email card renders when password
 * auth is enabled or the `magicLink` plugin is registered, and a plugin may
 * replace it via `cardOverrides.account.changeEmail` (the email-OTP plugin
 * swaps in its code-based flow). Plugin-contributed account cards (e.g.
 * `Appearance` from the theme plugin, multi-session accounts) are rendered
 * via the plugins array.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param variant - Card variant forwarded to each account settings card.
 * @returns The account settings container as a JSX element.
 */
export function AccountSettings({
  className,
  variant,
  ...props
}: AccountSettingsProps & ComponentProps<"div">) {
  const { emailAndPassword, plugins } = useAuth()

  const hasMagicLink = plugins.some((plugin) => plugin.id === "magicLink")

  const ChangeEmailOverride = plugins.find(
    (plugin) => plugin.cardOverrides?.account?.changeEmail
  )?.cardOverrides?.account?.changeEmail
  const ChangeEmailCard = ChangeEmailOverride ?? ChangeEmail

  // A plugin that replaces the card brings its own way to confirm the change,
  // so it can stand on its own without password or magic-link auth.
  const showChangeEmail =
    emailAndPassword?.enabled || hasMagicLink || Boolean(ChangeEmailOverride)

  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <UserProfile variant={variant} />
      {showChangeEmail && <ChangeEmailCard variant={variant} />}
      {plugins.flatMap((plugin) =>
        plugin.accountCards?.map((Card, index) => (
          <Card key={`${plugin.id}-${index.toString()}`} variant={variant} />
        ))
      )}
    </div>
  )
}
