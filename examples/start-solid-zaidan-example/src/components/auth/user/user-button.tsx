import { useAuth, useSession } from "@better-auth-ui/solid"
import { Link } from "@tanstack/solid-router"
import {
  ChevronsUpDown,
  LogIn,
  LogOut,
  Settings,
  User,
  UserPlus2
} from "lucide-solid"
import type { JSX } from "solid-js"
import { createMemo, createSignal, mergeProps, onMount, Show } from "solid-js"
import { ThemeToggleItem } from "@/components/auth/theme/theme-toggle-item"
import { UserAvatar } from "@/components/auth/user/user-avatar"
import { UserView } from "@/components/auth/user/user-view"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const menuLinkClass = "flex w-full items-center gap-1.5"

export type UserButtonLinkVisibility =
  | "authenticated"
  | "unauthenticated"
  | "always"

export type UserButtonLink = {
  href: string
  icon?: JSX.Element
  label: JSX.Element
  variant?: "default" | "destructive"
  visibility?: UserButtonLinkVisibility
}

const isUserButtonLink = (
  link: UserButtonLink | JSX.Element
): link is UserButtonLink =>
  typeof link === "object" && link !== null && "href" in link && "label" in link

const resolveUserLabel = (
  username?: string | null,
  name?: string | null,
  email?: string | null
) => username || name || email || "Account"

const resolveUserSecondaryLabel = (
  username?: string | null,
  name?: string | null,
  email?: string | null
) => (username || name ? email : undefined)

const resolveUserInitials = (
  username?: string | null,
  name?: string | null,
  email?: string | null
) => resolveUserLabel(username, name, email).slice(0, 2).toUpperCase()

export type UserButtonProps = {
  class?: string
  align?: "center" | "end" | "start"
  hideSettings?: boolean
  links?: (UserButtonLink | JSX.Element)[]
  sideOffset?: number
  size?: "default" | "icon"
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary"
}

function UserButtonPendingView() {
  return (
    <div class="flex items-center gap-2 text-left">
      <Skeleton class="size-8 rounded-full" />
      <div class="grid flex-1 gap-1 text-left text-sm">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}

function renderUserLink(link: UserButtonLink | JSX.Element) {
  if (!isUserButtonLink(link)) return link

  return (
    <DropdownMenuItem
      class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground"
      variant={link.variant}
    >
      <a class={menuLinkClass} href={link.href}>
        {link.icon}
        {link.label}
      </a>
    </DropdownMenuItem>
  )
}

export function UserButton(rawProps: UserButtonProps = {}) {
  const props = mergeProps(
    {
      align: "center" as const,
      size: "default" as const,
      variant: "ghost" as const
    },
    rawProps
  )
  const auth = useAuth()
  const session = useSession(auth.authClient, {
    enabled: !import.meta.env.SSR
  })
  const [isUserButtonHydrated, setIsUserButtonHydrated] = createSignal(false)
  const settingsLabel = () => auth.localization.settings.settings
  const size = () => props.size
  const contentClass = () =>
    cn(
      "w-[--kb-popper-anchor-width] min-w-40 md:min-w-56 max-w-[48svw] rounded-lg bg-popover p-1 text-popover-foreground shadow-md",
      props.align === "end" && "origin-top-right"
    )
  const triggerClass = () =>
    cn(
      buttonVariants({
        size: size() === "icon" ? "icon" : "lg",
        variant: props.variant
      }),
      size() === "icon"
        ? "rounded-full! border-0! p-0"
        : "py-2.5 h-auto font-normal justify-between gap-3 rounded-full",
      props.class
    )

  const userLinks = createMemo(() =>
    props.links?.flatMap((link) => {
      if (isUserButtonLink(link)) {
        const visibility = link.visibility ?? "always"
        if (visibility === "authenticated" && !session.data) return []
        if (visibility === "unauthenticated" && session.data) return []
      }

      return [renderUserLink(link)]
    })
  )

  onMount(() => setIsUserButtonHydrated(true))

  const signInPath = auth.viewPaths.auth.signIn
  const signUpPath = auth.viewPaths.auth.signUp
  const signOutPath = auth.viewPaths.auth.signOut
  const settingsPath = auth.viewPaths.settings.account

  const userLabel = () =>
    resolveUserLabel(
      undefined,
      session.data?.user.name,
      session.data?.user.email
    )

  const userSecondaryLabel = () =>
    resolveUserSecondaryLabel(
      undefined,
      session.data?.user.name,
      session.data?.user.email
    )

  const userInitials = () =>
    resolveUserInitials(
      undefined,
      session.data?.user.name,
      session.data?.user.email
    )

  return (
    <Show
      when={isUserButtonHydrated()}
      fallback={
        <div aria-hidden="true" class={triggerClass()}>
          <Show
            when={size() === "icon"}
            fallback={
              <>
                <UserButtonPendingView />
                <ChevronsUpDown class="size-4 text-muted-foreground" />
              </>
            }
          >
            <Skeleton class="size-8 rounded-full" />
          </Show>
        </div>
      }
    >
      <DropdownMenu gutter={props.sideOffset ?? 4} modal={false}>
        <DropdownMenuTrigger class={triggerClass()}>
          <Show
            when={size() === "icon"}
            fallback={
              <>
                <div class="flex min-w-0 items-center gap-3 text-left">
                  <Show
                    when={!session.isPending}
                    fallback={<UserButtonPendingView />}
                  >
                    <UserView
                      image={session.data?.user.image}
                      initials={session.data ? userInitials() : undefined}
                      label={userLabel()}
                      secondaryLabel={userSecondaryLabel()}
                    />
                  </Show>
                </div>

                <ChevronsUpDown class="size-4 text-muted-foreground" />
              </>
            }
          >
            <Show
              when={!session.isPending}
              fallback={<Skeleton class="size-8 rounded-full" />}
            >
              <UserAvatar
                fallback={<User class="size-4" />}
                image={session.data?.user.image}
                initials={session.data ? userInitials() : undefined}
                label={userLabel()}
              />
            </Show>
          </Show>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          class={contentClass()}
          style={{
            "min-width": "min(14rem, 48svw)",
            "max-width": "48svw",
            width: "max-content"
          }}
        >
          <Show when={session.data}>
            <DropdownMenuLabel class="px-2 py-1.5 text-sm font-normal text-foreground">
              <div class="flex items-center gap-3">
                <UserAvatar
                  class="size-10 rounded-full bg-muted text-muted-foreground"
                  image={session.data?.user.image}
                  initials={userInitials()}
                  label={userLabel()}
                />

                <div class="grid min-w-0 flex-1 gap-0.5">
                  <span class="truncate font-medium text-foreground">
                    {userLabel()}
                  </span>
                  <Show when={session.data?.user.email}>
                    <span class="truncate text-xs text-muted-foreground">
                      {session.data?.user.email}
                    </span>
                  </Show>
                </div>
              </div>
            </DropdownMenuLabel>

            <Separator class="my-1" />
          </Show>

          <Show
            when={!session.isPending}
            fallback={
              <DropdownMenuItem class="gap-1.5 rounded-md px-1.5 py-1 text-sm">
                <UserButtonPendingView />
              </DropdownMenuItem>
            }
          >
            <Show
              when={session.data}
              fallback={
                <>
                  {userLinks()}

                  <DropdownMenuItem class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground">
                    <Link
                      class={menuLinkClass}
                      params={{ path: signInPath }}
                      to="/auth/$path"
                    >
                      <LogIn class="size-4 text-muted-foreground" />
                      {auth.localization.auth.signIn}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground">
                    <Link
                      class={menuLinkClass}
                      params={{ path: signUpPath }}
                      to="/auth/$path"
                    >
                      <UserPlus2 class="size-4 text-muted-foreground" />
                      {auth.localization.auth.signUp}
                    </Link>
                  </DropdownMenuItem>

                  <ThemeToggleItem />
                </>
              }
            >
              {userLinks()}

              <Show when={!props.hideSettings}>
                <DropdownMenuItem class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground">
                  <Link
                    class={menuLinkClass}
                    params={{ path: settingsPath }}
                    to="/settings/$path"
                  >
                    <Settings class="size-4 text-muted-foreground" />
                    {settingsLabel()}
                  </Link>
                </DropdownMenuItem>
              </Show>

              <ThemeToggleItem />

              <DropdownMenuSeparator class="my-1 bg-border" />

              <DropdownMenuItem class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground">
                <Link
                  class={menuLinkClass}
                  params={{ path: signOutPath }}
                  to="/auth/$path"
                >
                  <LogOut class="size-4 text-muted-foreground" />
                  {auth.localization.auth.signOut}
                </Link>
              </DropdownMenuItem>
            </Show>
          </Show>
        </DropdownMenuContent>
      </DropdownMenu>
    </Show>
  )
}
