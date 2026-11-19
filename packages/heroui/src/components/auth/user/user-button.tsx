import { useAuth, useSession } from "@better-auth-ui/react"
import {
  ArrowRightFromSquare,
  ArrowRightToSquare,
  ChevronsExpandVertical,
  Gear,
  PersonPlus
} from "@gravity-ui/icons"
import {
  Button,
  type ButtonProps,
  cn,
  Dropdown,
  type DropdownItemProps,
  type DropdownPopoverProps,
  Label
} from "@heroui/react"
import {
  isValidElement,
  type JSX,
  type ReactElement,
  type ReactNode
} from "react"

import { UserAvatar } from "./user-avatar"
import { UserView } from "./user-view"

/** Auth states a `UserButton` link can be visible in. */
export type UserButtonLinkVisibility =
  | "authenticated"
  | "unauthenticated"
  | "always"

/** A simple link entry rendered as a `Dropdown.Item` in the `UserButton` menu. */
export type UserButtonLink = {
  /** Visible label. */
  label: ReactNode
  /** Destination URL. */
  href: string
  /** Optional leading icon. Sized/coloured to match built-in items. */
  icon?: ReactNode
  /** Forwarded to the underlying `Dropdown.Item`. */
  variant?: DropdownItemProps["variant"]
  /**
   * When this link is visible based on auth state.
   * @default "always"
   */
  visibility?: UserButtonLinkVisibility
}

export type UserButtonProps = {
  className?: string
  size?: "default" | "icon"
  /** The placement of the element with respect to its anchor element. */
  placement?: DropdownPopoverProps["placement"]
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
  fallbackKey: string
): ReactNode {
  if (isValidElement(link)) return link

  const { label, href, icon, variant } = link
  return (
    <Dropdown.Item
      key={fallbackKey}
      href={href}
      variant={variant}
      textValue={typeof label === "string" ? label : undefined}
    >
      {icon}
      <Label>{label}</Label>
    </Dropdown.Item>
  )
}

/**
 * Render a user account dropdown button that shows account actions.
 *
 * @param className - Additional CSS classes applied to the trigger element
 * @param placement - Dropdown popover placement (e.g., "bottom", "top-start", "bottom-end")
 * @param size - "icon" renders an avatar-only trigger; "default" renders a button with label and chevron
 * @param variant - Button visual variant passed to the underlying Button component
 * @param links - Additional menu entries rendered above the built-in items
 * @param hideSettings - Hide the built-in "Settings" link
 * @returns The user button and its dropdown menu as a JSX element
 */
export function UserButton({
  className,
  placement,
  size = "default",
  variant = "ghost",
  links,
  hideSettings,
  hideSubtitle
}: UserButtonProps): JSX.Element {
  const { authClient, basePaths, viewPaths, localization, plugins } = useAuth()

  const { data: session, isPending: sessionPending } = useSession(authClient)

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
    return [renderUserLink(link, `user-button-link-${index.toString()}`)]
  })

  return (
    <Dropdown>
      {size === "icon" ? (
        <Dropdown.Trigger className={cn("rounded-full")}>
          <UserAvatar className={className} />
        </Dropdown.Trigger>
      ) : (
        <Button
          variant={variant}
          className={cn(
            "h-auto font-normal justify-start px-2 py-2 text-left",
            className
          )}
        >
          {session || sessionPending ? (
            <UserView isPending={sessionPending} hideSubtitle={hideSubtitle} />
          ) : (
            <>
              <UserAvatar />

              <p className="text-sm font-medium">{localization.auth.account}</p>
            </>
          )}

          <ChevronsExpandVertical className="ml-auto size-3 text-muted" />
        </Button>
      )}

      <Dropdown.Popover
        placement={placement}
        className="min-w-40 md:min-w-56 max-w-[48svw]"
      >
        {session && (
          <div className="px-3 pt-3 pb-1">
            <UserView hideSubtitle={hideSubtitle} />
          </div>
        )}

        <Dropdown.Menu>
          {session ? (
            <>
              {userLinks}

              {!hideSettings && (
                <Dropdown.Item
                  textValue={localization.settings.settings}
                  href={`${basePaths.settings}/${viewPaths.settings.account}`}
                >
                  <Gear className="text-muted" />

                  <Label>{localization.settings.settings}</Label>
                </Dropdown.Item>
              )}

              {userMenuItems}

              <Dropdown.Item
                textValue={localization.auth.signOut}
                href={`${basePaths.auth}/${viewPaths.auth.signOut}`}
                variant="danger"
              >
                <ArrowRightFromSquare className="text-danger" />

                <Label>{localization.auth.signOut}</Label>
              </Dropdown.Item>
            </>
          ) : (
            <>
              {userLinks}

              <Dropdown.Item
                textValue={localization.auth.signIn}
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              >
                <ArrowRightToSquare className="text-muted" />

                <Label>{localization.auth.signIn}</Label>
              </Dropdown.Item>

              <Dropdown.Item
                textValue={localization.auth.signUp}
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              >
                <PersonPlus className="text-muted" />

                <Label>{localization.auth.signUp}</Label>
              </Dropdown.Item>

              {userMenuItems}
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
