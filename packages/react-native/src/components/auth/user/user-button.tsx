import type { AuthPlugin as ReactAuthPlugin } from "@better-auth-ui/react"
import { useAuth, useSession } from "@better-auth-ui/react"
import {
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState
} from "react"
import { Linking, Modal, Pressable, Text, View } from "react-native"
import { cn } from "../../../lib/cn"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button, type ButtonProps } from "../../../primitives/button"
import {
  ArrowRightFromSquare,
  ArrowRightToSquare,
  ChevronsExpandVertical,
  Gear,
  PersonPlus
} from "../../../primitives/ui-icons"
import { UserAvatar } from "./user-avatar"
import { UserView } from "./user-view"

// Widen the plugin type `useAuth().plugins` resolves to so RN plugins can
// contribute `userMenuItems`, mirroring the heroui registration.
declare module "@better-auth-ui/core" {
  interface AuthPluginRegister {
    reactNative: ReactAuthPlugin
  }
}

/** Auth states a `UserButton` link can be visible in. */
export type UserButtonLinkVisibility =
  | "authenticated"
  | "unauthenticated"
  | "always"

/** A simple link entry rendered as a menu row in the `UserButton` menu. */
export type UserButtonLink = {
  /** Visible label. */
  label: ReactNode
  /** Destination URL. */
  href: string
  /** Optional leading icon. Sized/coloured to match built-in items. */
  icon?: ReactNode
  /** Forwarded to the underlying menu row. */
  variant?: "danger"
  /**
   * When this link is visible based on auth state.
   * @default "always"
   */
  visibility?: UserButtonLinkVisibility
}

export type UserButtonProps = {
  className?: string
  size?: "default" | "icon"
  variant?: ButtonProps["variant"]
  /** Additional menu entries rendered above the built-in items. */
  links?: (UserButtonLink | ReactElement)[]
  /** Hide the built-in "Settings" link. Useful when replacing it via `links`. */
  hideSettings?: boolean
  /** When true, the subtitle line (email when name/username is shown) is hidden. */
  hideSubtitle?: boolean
}

function renderUserLink(
  link: UserButtonLink | ReactElement,
  fallbackKey: string,
  close: () => void
): ReactNode {
  if (isValidElement(link)) return link

  const { label, icon, variant, href } = link
  return (
    <Pressable
      key={fallbackKey}
      className="flex-row items-center gap-2 px-3 py-2"
      onPress={() => {
        close()
        // The library only owns the auth navigation adapter, so plain-object
        // links navigate to external URLs; for in-app routes pass a ReactElement.
        if (/^https?:\/\//.test(href)) void Linking.openURL(href)
      }}
    >
      {icon}
      <Text
        className={cn(
          "text-sm text-neutral-900 dark:text-neutral-50",
          variant === "danger" && "text-red-600 dark:text-red-400"
        )}
      >
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * Render a user account menu button that shows account actions.
 *
 * @param className - Additional classes applied to the trigger element
 * @param size - "icon" renders an avatar-only trigger; "default" renders a button with label and chevron
 * @param variant - Button visual variant passed to the underlying Button component
 * @param links - Additional menu entries rendered above the built-in items
 * @param hideSettings - Hide the built-in "Settings" link
 * @returns The user button and its menu modal as a JSX element
 */
export function UserButton({
  className,
  size = "default",
  variant = "ghost",
  links,
  hideSettings,
  hideSubtitle
}: UserButtonProps) {
  const { authClient, basePaths, localization, plugins, viewPaths, navigate } =
    useAuth()
  const navigation = useAuthNavigation()

  const { data: session, isPending: sessionPending } = useSession(authClient)

  const [open, setOpen] = useState(false)

  const userMenuItems = plugins.flatMap(
    (plugin) =>
      plugin.userMenuItems?.map((Item, index) => (
        <Item
          key={`${plugin.id}-${index.toString()}`}
          hideSubtitle={hideSubtitle}
        />
      )) ?? []
  )

  const userLinks = links?.flatMap((link, index) => {
    if (!isValidElement(link)) {
      const visibility = link.visibility ?? "always"
      if (visibility === "authenticated" && !session) return []
      if (visibility === "unauthenticated" && session) return []
    }
    return [
      renderUserLink(link, `user-button-link-${index.toString()}`, () => {
        setOpen(false)
      })
    ]
  })

  return (
    <>
      {size === "icon" ? (
        <Pressable
          className={cn("rounded-full", className)}
          onPress={() => setOpen(true)}
        >
          <UserAvatar size="md" />
        </Pressable>
      ) : (
        <Button
          variant={variant}
          className={cn(
            "h-auto flex-row items-center justify-start px-2 py-2",
            className
          )}
          onPress={() => setOpen(true)}
        >
          {session || sessionPending ? (
            <UserView isPending={sessionPending} hideSubtitle={hideSubtitle} />
          ) : (
            <>
              <UserAvatar />

              <Text className="text-sm font-medium">
                {localization.auth.account}
              </Text>
            </>
          )}

          <ChevronsExpandVertical
            width={12}
            height={12}
            color="#a3a3a3"
            className="ml-auto"
          />
        </Button>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="gap-1 rounded-t-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900"
            onPress={(event) => event.stopPropagation()}
          >
            {session && (
              <View className="px-3 pt-3 pb-1">
                <UserView hideSubtitle={hideSubtitle} />
              </View>
            )}

            {session ? (
              <>
                {userLinks}

                {!hideSettings && (
                  <Pressable
                    className="flex-row items-center gap-2 px-3 py-2"
                    onPress={() => {
                      setOpen(false)
                      navigate({
                        to: `${basePaths.settings}/${viewPaths.settings.account}`
                      })
                    }}
                  >
                    <Gear width={18} height={18} color="#a3a3a3" />
                    <Text className="text-sm text-neutral-900 dark:text-neutral-50">
                      {localization.settings.settings}
                    </Text>
                  </Pressable>
                )}

                {userMenuItems}

                <Pressable
                  className="flex-row items-center gap-2 px-3 py-2"
                  onPress={() => {
                    setOpen(false)
                    navigation.push("signOut")
                  }}
                >
                  <ArrowRightFromSquare
                    width={18}
                    height={18}
                    color="#dc2626"
                  />
                  <Text className="text-sm text-red-600 dark:text-red-400">
                    {localization.auth.signOut}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {userLinks}

                <Pressable
                  className="flex-row items-center gap-2 px-3 py-2"
                  onPress={() => {
                    setOpen(false)
                    navigation.push("signIn")
                  }}
                >
                  <ArrowRightToSquare width={18} height={18} color="#a3a3a3" />
                  <Text className="text-sm text-neutral-900 dark:text-neutral-50">
                    {localization.auth.signIn}
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-row items-center gap-2 px-3 py-2"
                  onPress={() => {
                    setOpen(false)
                    navigation.push("signUp")
                  }}
                >
                  <PersonPlus width={18} height={18} color="#a3a3a3" />
                  <Text className="text-sm text-neutral-900 dark:text-neutral-50">
                    {localization.auth.signUp}
                  </Text>
                </Pressable>

                {userMenuItems}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
