import { useAuth, useSession } from "@better-auth-ui/solid"
import {
  ChevronsUpDown,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  PaletteIcon,
  Settings,
  Sun,
  User,
  UserPlus2
} from "lucide-solid"
import { createSignal, mergeProps, onMount, Show } from "solid-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  applyThemePreference,
  isThemeMode,
  readStoredThemePreference,
  saveThemePreference,
  type ThemeMode
} from "@/lib/theme"
import { cn } from "@/lib/utils"

const authHref = (basePath: string, viewPath: string) =>
  `${basePath}/${viewPath}`

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

type UserButtonProps = {
  class?: string
  align?: "center" | "end" | "start"
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

function ThemeToggleItem() {
  const [theme, setTheme] = createSignal<ThemeMode>("system")
  let tabsListElement!: HTMLDivElement

  onMount(() => {
    const initialTheme = readStoredThemePreference()

    setTheme(initialTheme)
    applyThemePreference(initialTheme)
  })

  const selectTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme)
    saveThemePreference(nextTheme)
    applyThemePreference(nextTheme)
  }

  const focusActiveTab = () => {
    const activeTab = tabsListElement?.querySelector<HTMLElement>(
      '[role="tab"][data-selected]'
    )

    activeTab?.focus({ preventScroll: true })
  }

  const handleTabsKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return

    const target = event.target as HTMLElement
    if (target.getAttribute("role") !== "tab") return

    const wrapper = target.closest<HTMLElement>('[role="menuitem"]')
    const content = wrapper?.closest<HTMLElement>(
      '[data-slot="dropdown-menu-content"]'
    )
    if (!wrapper || !content) return

    const items = Array.from(
      content.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])'
      )
    )
    const currentIndex = items.indexOf(wrapper)
    const nextIndex =
      event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1
    const next = items[nextIndex]
    if (!next) return

    event.preventDefault()
    next.focus()
  }

  return (
    <DropdownMenuItem
      class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground"
      closeOnSelect={false}
      onFocus={(event) => {
        if (event.target === event.currentTarget) focusActiveTab()
      }}
    >
      <div class="flex w-full items-center gap-2">
        <PaletteIcon class="size-4 text-muted-foreground" />
        <span>Theme</span>

        <Tabs
          class="ml-auto"
          onKeyDown={handleTabsKeyDown}
          onChange={(nextTheme) => {
            if (isThemeMode(nextTheme)) selectTheme(nextTheme)
          }}
          value={theme()}
        >
          <TabsList class="h-6!" ref={tabsListElement}>
            <TabsTrigger aria-label="System" class="size-5 p-0" value="system">
              <Monitor class="size-3" />
            </TabsTrigger>
            <TabsTrigger aria-label="Light" class="size-5 p-0" value="light">
              <Sun class="size-3" />
            </TabsTrigger>
            <TabsTrigger aria-label="Dark" class="size-5 p-0" value="dark">
              <Moon class="size-3" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
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
  const session = useSession(auth.authClient)
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

  onMount(() => setIsUserButtonHydrated(true))

  const signInHref = authHref(auth.basePaths.auth, auth.viewPaths.auth.signIn)
  const signUpHref = authHref(auth.basePaths.auth, auth.viewPaths.auth.signUp)
  const signOutHref = authHref(auth.basePaths.auth, auth.viewPaths.auth.signOut)

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
                    <div class="contents">
                      <Avatar class="size-9 rounded-full bg-muted text-muted-foreground">
                        <AvatarImage
                          alt={userLabel()}
                          src={session.data?.user.image ?? undefined}
                        />
                        <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
                          <Show
                            when={session.data}
                            fallback={<User class="size-4" />}
                          >
                            {userInitials()}
                          </Show>
                        </AvatarFallback>
                      </Avatar>

                      <div class="grid min-w-0 flex-1 text-sm leading-tight">
                        <span class="truncate font-medium text-foreground">
                          <Show
                            when={session.data}
                            fallback={auth.localization.auth.account}
                          >
                            {userLabel()}
                          </Show>
                        </span>

                        <Show when={session.data && userSecondaryLabel()}>
                          <span class="truncate text-xs text-muted-foreground">
                            {userSecondaryLabel()}
                          </span>
                        </Show>
                      </div>
                    </div>
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
              <Avatar class="size-9 rounded-full bg-muted text-muted-foreground">
                <AvatarImage
                  alt={userLabel()}
                  src={session.data?.user.image ?? undefined}
                />
                <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
                  <Show when={session.data} fallback={<User class="size-4" />}>
                    {userInitials()}
                  </Show>
                </AvatarFallback>
              </Avatar>
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
                <Avatar class="size-10 rounded-full bg-muted text-muted-foreground">
                  <AvatarImage
                    alt={userLabel()}
                    src={session.data?.user.image ?? undefined}
                  />
                  <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
                    {userInitials()}
                  </AvatarFallback>
                </Avatar>

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
            when={session.data}
            fallback={
              <>
                <DropdownMenuItem
                  as="a"
                  class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground"
                  href={signInHref}
                >
                  <LogIn class="size-4 text-muted-foreground" />
                  {auth.localization.auth.signIn}
                </DropdownMenuItem>

                <DropdownMenuItem
                  as="a"
                  class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground"
                  href={signUpHref}
                >
                  <UserPlus2 class="size-4 text-muted-foreground" />
                  {auth.localization.auth.signUp}
                </DropdownMenuItem>

                <ThemeToggleItem />
              </>
            }
          >
            <DropdownMenuItem
              class="gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted-foreground"
              disabled
            >
              <Settings class="size-4 text-muted-foreground" />
              {settingsLabel()}
            </DropdownMenuItem>

            <ThemeToggleItem />

            <DropdownMenuSeparator class="my-1 bg-border" />

            <DropdownMenuItem
              as="a"
              class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground"
              href={signOutHref}
            >
              <LogOut class="size-4 text-muted-foreground" />
              {auth.localization.auth.signOut}
            </DropdownMenuItem>
          </Show>
        </DropdownMenuContent>
      </DropdownMenu>
    </Show>
  )
}
