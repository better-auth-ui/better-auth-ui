import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import {
  organizationLocalization as defaultOrganizationLocalization,
  type OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useListOrganizations,
  useSetActiveOrganization
} from "@better-auth-ui/solid/plugins/organization"
import { useNavigate } from "@tanstack/solid-router"
import type { Organization } from "better-auth/client"
import {
  ChevronsUpDown,
  PlusCircle,
  Settings as SettingsIcon
} from "lucide-solid"
import type { JSX } from "solid-js"
import {
  createMemo,
  createSignal,
  For,
  mergeProps,
  onMount,
  Show
} from "solid-js"
import { UserView } from "@/components/auth/user/user-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationView } from "./organization-view"

export type OrganizationSwitcherProps = {
  class?: string
  trigger?: JSX.Element
  hidePersonal?: boolean
  hideSettings?: boolean
  hideSlug?: boolean
  hideCreate?: boolean
  setActive?: (organization: Organization | null) => void
}

type OrganizationPluginConfig = {
  slug?: string | null
  localization?: Pick<
    OrganizationLocalization,
    "createOrganization" | "organization" | "organizations" | "manage"
  >
}

function OrganizationSwitcherTrigger(rawProps: OrganizationSwitcherProps = {}) {
  const props = mergeProps({ hideSlug: true }, rawProps)

  return (
    <Show
      when={props.trigger}
      fallback={
        <Button
          class={cn("h-auto px-2 py-2 text-left", props.class)}
          disabled
          variant="ghost"
        >
          <OrganizationView isPending hideRole hideSlug={props.hideSlug} />
          <ChevronsUpDown class="size-4 shrink-0 text-muted-foreground" />
        </Button>
      }
    >
      {props.trigger}
    </Show>
  )
}

function MountedOrganizationSwitcher(rawProps: OrganizationSwitcherProps = {}) {
  const props = mergeProps({ hideSlug: true }, rawProps)
  const auth = useAuth<OrganizationAuthClient>()
  const client = auth.authClient
  const navigate = useNavigate()
  const session = useSession(client)
  const activeOrganization = useActiveOrganization(client)
  const organizations = useListOrganizations(client)
  const setActiveOrganization = useSetActiveOrganization(client)
  const [createOpen, setCreateOpen] = createSignal(false)
  const [isOpen, setIsOpen] = createSignal(false)
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | OrganizationPluginConfig
      | undefined
  const organizationViewPaths = () =>
    organizationPlugin().viewPaths.organization ?? { settings: "settings" }
  const localization = () =>
    organizationPluginConfig()?.localization ?? defaultOrganizationLocalization
  const isSlugMode = () => {
    const plugin = organizationPluginConfig()

    if (!plugin) return false

    return plugin.slug !== undefined
  }
  const isPending = () =>
    session.isPending ||
    (!!session.data &&
      (organizations.isPending || activeOrganization.isPending))
  const shouldShowSlug = () => !props.hideSlug
  const selectableOrganizations = () =>
    ((organizations.data ?? []) as Organization[]).filter(
      (organization) => organization.id !== activeOrganization.data?.id
    )
  const hasOtherEntries = () =>
    selectableOrganizations().length > 0 ||
    (!!activeOrganization.data && !props.hidePersonal)

  const navigateToOrganization = (organization: Organization) => {
    navigate({
      to: "/organization/$slug/$path",
      params: {
        slug: organization.slug,
        path: organizationViewPaths().settings
      }
    })
  }

  const navigateToPersonal = () => {
    navigate({
      to: "/settings/$path",
      params: { path: auth.viewPaths.settings.account }
    })
  }

  const navigateToActiveOrganizationSettings = () => {
    const active = activeOrganization.data

    if (!active) {
      navigate({
        to: "/settings/$path",
        params: { path: auth.viewPaths.settings.account }
      })
      return
    }

    navigateToOrganization(active as Organization)
  }

  const handleSetActive = (organization: Organization | null) => {
    setIsOpen(false)

    if (organization) props.setActive?.(organization)
    if (!organization) props.setActive?.(null)
    if (props.setActive) return

    if (isSlugMode()) {
      if (organization) {
        navigateToOrganization(organization)
        return
      }

      navigateToPersonal()
      return
    }

    setActiveOrganization.mutate(
      { organizationId: organization?.id ?? null },
      {
        onSuccess: () => {
          if (organization) {
            navigateToOrganization(organization)
            return
          }

          navigateToPersonal()
        }
      }
    )
  }

  return (
    <>
      <DropdownMenu open={isOpen()} onOpenChange={setIsOpen}>
        <Show
          when={props.trigger}
          fallback={
            <DropdownMenuTrigger
              as={Button}
              variant="ghost"
              class={cn("h-auto px-2 py-2 text-left", props.class)}
              disabled={!session.data || isPending()}
            >
              <Show
                when={!isPending()}
                fallback={
                  <OrganizationView
                    isPending
                    hideRole
                    hideSlug={props.hideSlug}
                  />
                }
              >
                <Show
                  when={activeOrganization.data}
                  fallback={
                    <Show
                      when={
                        !props.hidePersonal ? session.data?.user : undefined
                      }
                      fallback={
                        <OrganizationView
                          hideRole
                          hideSlug={props.hideSlug}
                          organization={{
                            name: localization().organization
                          }}
                        />
                      }
                    >
                      {(user) => (
                        <UserView hideSubtitle={props.hideSlug} user={user()} />
                      )}
                    </Show>
                  }
                >
                  {(organization) => (
                    <OrganizationView
                      hideRole
                      hideSlug={!shouldShowSlug()}
                      organization={organization()}
                    />
                  )}
                </Show>
              </Show>

              <ChevronsUpDown class="size-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
          }
        >
          <DropdownMenuTrigger as="span" class={props.class}>
            {props.trigger}
          </DropdownMenuTrigger>
        </Show>
        <DropdownMenuContent class="min-w-64 max-w-svw">
          <Show when={activeOrganization.data}>
            {(organization) => (
              <div class="flex items-center justify-between gap-4 px-2 py-2">
                <OrganizationView
                  hideRole
                  hideSlug={props.hideSlug}
                  organization={organization()}
                />

                <Show when={!props.hideSettings}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToActiveOrganizationSettings}
                  >
                    <SettingsIcon class="text-muted-foreground" />
                    {localization().manage}
                  </Button>
                </Show>
              </div>
            )}
          </Show>

          <Show
            when={
              !activeOrganization.data && !isPending() && !props.hidePersonal
                ? session.data?.user
                : undefined
            }
          >
            {(resolvedSession) => (
              <div class="flex items-center justify-between gap-4 px-2 py-2">
                <UserView
                  hideSubtitle={props.hideSlug}
                  user={resolvedSession()}
                />

                <Show when={!props.hideSettings}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToPersonal}
                  >
                    <SettingsIcon class="text-muted-foreground" />
                    {auth.localization.settings.settings}
                  </Button>
                </Show>
              </div>
            )}
          </Show>

          <DropdownMenuSeparator />

          <Show when={activeOrganization.data && !props.hidePersonal}>
            <DropdownMenuItem onSelect={() => handleSetActive(null)}>
              <UserView hideSubtitle={props.hideSlug} />
            </DropdownMenuItem>
          </Show>

          <For each={selectableOrganizations()}>
            {(organization) => (
              <DropdownMenuItem onSelect={() => handleSetActive(organization)}>
                <OrganizationView
                  hideRole
                  hideSlug={props.hideSlug}
                  organization={organization}
                />
              </DropdownMenuItem>
            )}
          </For>

          <Show when={!props.hideCreate}>
            <Show when={hasOtherEntries()}>
              <DropdownMenuSeparator />
            </Show>

            <DropdownMenuItem
              onSelect={() => {
                setIsOpen(false)
                setCreateOpen(true)
              }}
            >
              <PlusCircle class="text-muted-foreground" />
              {localization().createOrganization}
            </DropdownMenuItem>
          </Show>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrganizationDialog
        open={createOpen()}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}

export function OrganizationSwitcher(props: OrganizationSwitcherProps = {}) {
  const [isMounted, setIsMounted] = createSignal(false)

  onMount(() => setIsMounted(true))

  const content = createMemo(() =>
    isMounted() ? (
      <MountedOrganizationSwitcher {...props} />
    ) : (
      <OrganizationSwitcherTrigger {...props} />
    )
  )

  return <>{content()}</>
}
