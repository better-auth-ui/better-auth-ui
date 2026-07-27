"use client"

import { useAuth } from "@better-auth-ui/react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { ChangeEmail } from "./change-email"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = {
  className?: string
}

/**
 * Renders the account settings layout.
 *
 * Uses `emailAndPassword` and `plugins` from `useAuth()` to conditionally
 * show sections:
 * - `UserProfile` always renders.
 * - The change-email card renders when `emailAndPassword?.enabled` is truthy
 *   or the `magicLink` plugin is registered, and a plugin may replace it via
 *   `cardOverrides.account.changeEmail` (the email-OTP plugin swaps in its
 *   code-based flow).
 * - Plugin-contributed account cards are rendered via the plugins array
 *   (e.g. `Appearance` from the theme plugin, multi-session accounts).
 */
export function AccountSettings({
  className,
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
      <UserProfile />
      {showChangeEmail && <ChangeEmailCard />}
      {plugins.flatMap(
        (plugin) =>
          plugin.accountCards?.map((Card, index) => (
            <Card key={`${plugin.id}-${index.toString()}`} />
          )) ?? []
      )}
    </div>
  )
}
