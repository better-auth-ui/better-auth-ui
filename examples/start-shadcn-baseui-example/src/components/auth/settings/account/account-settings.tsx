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
 * - `ChangeEmail` renders when `emailAndPassword?.enabled` is truthy or the
 *   `magicLink` plugin is registered.
 * - Plugin-contributed account cards are rendered via the plugins array
 *   (e.g. `Appearance` from the theme plugin, multi-session accounts).
 */
export function AccountSettings({
  className,
  ...props
}: AccountSettingsProps & ComponentProps<"div">) {
  const { emailAndPassword, plugins } = useAuth()

  const hasMagicLink = plugins.some((plugin) => plugin.id === "magicLink")

  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <UserProfile />
      {(emailAndPassword?.enabled || hasMagicLink) && <ChangeEmail />}
      {plugins.flatMap(
        (plugin) =>
          plugin.accountCards?.map((Card, index) => (
            <Card key={`${plugin.id}-${index.toString()}`} />
          )) ?? []
      )}
    </div>
  )
}
