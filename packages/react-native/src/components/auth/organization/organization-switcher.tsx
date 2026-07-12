import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthPlugin,
  useListOrganizations,
  useSession,
  useSetActiveOrganization
} from "@better-auth-ui/react"
import type { Organization } from "better-auth/client"
import { type ReactNode, useState } from "react"
import { Pressable, Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button, type ButtonProps } from "../../../primitives/button"
import { Menu } from "../../../primitives/menu"
import {
  ChevronsExpandVertical,
  CirclePlus,
  Gear
} from "../../../primitives/ui-icons"
import { UserView } from "../user/user-view"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationView } from "./organization-view"

/** Props for the {@link OrganizationSwitcher} component. */
export type OrganizationSwitcherProps = {
  className?: string
  variant?: ButtonProps["variant"]
  trigger?: ReactNode
  hideCreate?: boolean
  hidePersonal?: boolean
  hideSettings?: boolean
  hideSlug?: boolean
  setActive?: (organization: Organization | null) => void
}

/**
 * Renders an organizations menu with a trigger button, header summary, and a
 * list of organizations to switch to. Mirrors the heroui `OrganizationSwitcher`,
 * adapted for React Native: the `Dropdown` popover becomes the shared `Menu`
 * bottom-sheet primitive (same pattern as `UserButton`'s menu), and the
 * "Manage" affordance and organization switching go through
 * `useAuthNavigation().push(...)` / `setActiveOrganization` instead of raw
 * URL navigation.
 */
export function OrganizationSwitcher({
  className,
  hideCreate,
  hidePersonal,
  hideSettings,
  hideSlug = true,
  setActive,
  variant = "ghost",
  size = "md",
  trigger,
  ...props
}: OrganizationSwitcherProps & ButtonProps) {
  const { authClient, localization } = useAuth()
  const { data: session, isPending: sessionPending } = useSession(authClient)
  const { localization: organizationLocalization, slug } =
    useAuthPlugin(organizationPlugin)

  const navigation = useAuthNavigation()
  const colors = useThemeColors()

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient as OrganizationAuthClient)

  const { mutate: setActiveOrganization } = useSetActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const isPending =
    sessionPending ||
    (!!session && (organizationsPending || activeOrganizationPending))

  const [createOpen, setCreateOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSetActive(organization: Organization | null) {
    if (setActive) {
      setActive(organization)
    } else if (slug !== undefined && organization) {
      navigation.push({
        section: "organization",
        view: "settings",
        slug: organization.slug
      })
    } else if (slug !== undefined) {
      navigation.push({ section: "settings", view: "account" })
    } else {
      setActiveOrganization({ organizationId: organization?.id ?? null })
    }
  }

  function manageActiveOrganization() {
    setMenuOpen(false)
    if (slug !== undefined && activeOrganization) {
      navigation.push({
        section: "organization",
        view: "settings",
        slug: activeOrganization.slug
      })
    } else {
      navigation.push({ section: "organization", view: "settings" })
    }
  }

  function managePersonalAccount() {
    setMenuOpen(false)
    navigation.push({ section: "settings", view: "account" })
  }

  const otherOrganizations = organizations?.filter(
    (organization) => organization.id !== activeOrganization?.id
  )

  return (
    <>
      {trigger ? (
        <Pressable onPress={() => setMenuOpen(true)}>{trigger}</Pressable>
      ) : (
        <Button
          variant={variant}
          className={cn("h-auto flex-row items-center px-2 py-2", className)}
          isDisabled={!session || isPending}
          aria-label={organizationLocalization.organization}
          onPress={() => setMenuOpen(true)}
          {...props}
        >
          {isPending ? (
            <OrganizationView
              size={size}
              isPending
              hideRole
              hideSlug={hideSlug}
            />
          ) : activeOrganization ? (
            <OrganizationView size={size} hideRole hideSlug={hideSlug} />
          ) : session && !hidePersonal ? (
            <UserView size={size} hideSubtitle={hideSlug} />
          ) : (
            <OrganizationView
              size={size}
              hideRole
              hideSlug={hideSlug}
              organization={{ name: organizationLocalization.organization }}
            />
          )}

          <ChevronsExpandVertical
            width={12}
            height={12}
            color={colors.muted}
            className="ml-auto shrink-0"
          />
        </Button>
      )}

      <Menu isOpen={menuOpen} onOpenChange={setMenuOpen}>
        {activeOrganization ? (
          <View className="flex-row items-center justify-between gap-4 px-2 pt-1 pb-2">
            <OrganizationView
              hideRole
              hideSlug={hideSlug}
              organization={activeOrganization}
            />

            {!hideSettings && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onPress={manageActiveOrganization}
              >
                <Gear width={16} height={16} color={colors.muted} />
                {organizationLocalization.manage}
              </Button>
            )}
          </View>
        ) : !isPending && session?.user && !hidePersonal ? (
          <View className="flex-row items-center justify-between gap-4 px-2 pt-1 pb-2">
            <UserView hideSubtitle={hideSlug} />

            {!hideSettings && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onPress={managePersonalAccount}
              >
                <Gear width={16} height={16} color={colors.muted} />
                {localization.settings.settings}
              </Button>
            )}
          </View>
        ) : null}

        {!!activeOrganization && !hidePersonal && (
          <Menu.Item onPress={() => handleSetActive(null)}>
            <UserView hideSubtitle={hideSlug} />
          </Menu.Item>
        )}

        {otherOrganizations?.map((organization) => (
          <Menu.Item
            key={organization.id}
            onPress={() => handleSetActive(organization)}
          >
            <OrganizationView
              hideRole
              hideSlug={hideSlug}
              organization={organization}
            />
          </Menu.Item>
        ))}

        {!hideCreate && (
          <Menu.Item
            icon={<CirclePlus width={18} height={18} color={colors.muted} />}
            onPress={() => setCreateOpen(true)}
          >
            <Text className="text-sm text-foreground">
              {organizationLocalization.createOrganization}
            </Text>
          </Menu.Item>
        )}
      </Menu>

      <CreateOrganizationDialog
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
