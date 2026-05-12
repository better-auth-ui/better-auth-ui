import {
  fileToBase64,
  getProviderName,
  type SettingsView
} from "@better-auth-ui/core"
import {
  type ApiKeyAuthClient,
  listApiKeysOptions,
  listDeviceSessionsOptions,
  listPasskeysOptions,
  type MultiSessionAuthClient,
  type PasskeyAuthClient,
  updateUserOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import {
  KeyRound,
  Link2,
  LogOut,
  Monitor,
  Moon,
  Plug,
  Sun,
  Trash2,
  Upload
} from "lucide-solid"
import type { JSX } from "solid-js"
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  Show
} from "solid-js"
import { toast } from "solid-sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  applyThemePreference,
  readStoredThemePreference,
  saveThemePreference,
  type ThemeMode
} from "@/lib/theme"
import { cn } from "@/lib/utils"

type SettingsSession = ReturnType<typeof useSession>

type SettingsPanel = {
  component: Component<{ session: SettingsSession }>
  title: string
}

type SecurityCardsPlugin = {
  id: string
  securityCards?: Component[]
}

const hasAuthPlugin = (plugins: { id: string }[], id: string) =>
  plugins.some((plugin) => plugin.id === id)

export type SettingsRouteResolution = SettingsPanel | { redirectTo: string }

const settingsPathViews = () => {
  const auth = useAuth()

  return Object.fromEntries(
    Object.entries(auth.viewPaths.settings).map(([view, path]) => [path, view])
  ) as Record<string, SettingsView>
}

const resolveUserLabel = (name?: string | null, email?: string | null) =>
  name?.trim() || email?.trim() || "Signed in user"

const resolveUserInitials = (name?: string | null, email?: string | null) =>
  resolveUserLabel(name, email).slice(0, 2).toUpperCase()

export function shouldLoadLinkedAccounts(props: {
  isSsr: boolean
  userId?: string
}) {
  return !props.isSsr && Boolean(props.userId)
}

export const shouldLoadDeviceSessions = shouldLoadLinkedAccounts

function SettingsUnavailableNotice(props: { children: string }) {
  return (
    <p class="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      {props.children}
    </p>
  )
}

const getUsername = (session: SettingsSession) =>
  (session.data?.user as { username?: string | null } | undefined)?.username ??
  ""

type ThemePreviewSvgProps = JSX.SvgSVGAttributes<SVGSVGElement>

function ThemePreviewLightPaths() {
  return (
    <>
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        fill="white"
      />
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        stroke="#E4E4E7"
      />
      <path
        d="M32 48.5C32 45.4624 34.4624 43 37.5 43H67.5C70.5376 43 73 45.4624 73 48.5C73 51.5376 70.5376 54 67.5 54H37.5C34.4624 54 32 51.5376 32 48.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 105C17 101.686 19.6863 99 23 99H67C70.3137 99 73 101.686 73 105C73 108.314 70.3137 111 67 111H23C19.6863 111 17 108.314 17 105Z"
        fill="#F4F4F5"
      />
      <path
        d="M88 25.5C88 22.4624 90.4624 20 93.5 20H207.5C210.538 20 213 22.4624 213 25.5C213 28.5376 210.538 31 207.5 31H93.5C90.4624 31 88 28.5376 88 25.5Z"
        fill="#E4E4E7"
      />
      <path
        d="M88 105C88 101.686 90.6863 99 94 99H189C192.314 99 195 101.686 195 105C195 108.314 192.314 111 189 111H94C90.6863 111 88 108.314 88 105Z"
        fill="#F4F4F5"
      />
      <path
        d="M88 51C88 46.5817 91.5817 43 96 43H221C225.418 43 229 46.5817 229 51V85C229 89.4183 225.418 93 221 93H96C91.5817 93 88 89.4183 88 85V51Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 48.5C17 45.4624 19.4624 43 22.5 43C25.5376 43 28 45.4624 28 48.5C28 51.5376 25.5376 54 22.5 54C19.4624 54 17 51.5376 17 48.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 66.5C17 63.4624 19.4624 61 22.5 61C25.5376 61 28 63.4624 28 66.5C28 69.5376 25.5376 72 22.5 72C19.4624 72 17 69.5376 17 66.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 86.5C17 83.4624 19.4624 81 22.5 81C25.5376 81 28 83.4624 28 86.5V87.5C28 90.5376 25.5376 93 22.5 93C19.4624 93 17 90.5376 17 87.5V86.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M32 25.5C32 22.4624 34.4624 20 37.5 20H67.5C70.5376 20 73 22.4624 73 25.5C73 28.5376 70.5376 31 67.5 31H37.5C34.4624 31 32 28.5376 32 25.5Z"
        fill="#E4E4E7"
      />
      <path
        d="M32 66.5C32 63.4624 34.4624 61 37.5 61H67.5C70.5376 61 73 63.4624 73 66.5C73 69.5376 70.5376 72 67.5 72H37.5C34.4624 72 32 69.5376 32 66.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M32 87C32 83.6863 34.6863 81 38 81H67C70.3137 81 73 83.6863 73 87C73 90.3137 70.3137 93 67 93H38C34.6863 93 32 90.3137 32 87Z"
        fill="#F4F4F5"
      />
      <circle cx="22.5" cy="25.5" fill="#E4E4E7" r="5.5" />
    </>
  )
}

function ThemePreviewDarkPaths() {
  return (
    <>
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        fill="black"
      />
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        stroke="#3F3F46"
      />
      <path
        d="M32 48.5C32 45.4624 34.4624 43 37.5 43H67.5C70.5376 43 73 45.4624 73 48.5C73 51.5376 70.5376 54 67.5 54H37.5C34.4624 54 32 51.5376 32 48.5Z"
        fill="#27272A"
      />
      <path
        d="M17 105C17 101.686 19.6863 99 23 99H67C70.3137 99 73 101.686 73 105C73 108.314 70.3137 111 67 111H23C19.6863 111 17 108.314 17 105Z"
        fill="#27272A"
      />
      <path
        d="M88 25.5C88 22.4624 90.4624 20 93.5 20H207.5C210.538 20 213 22.4624 213 25.5C213 28.5376 210.538 31 207.5 31H93.5C90.4624 31 88 28.5376 88 25.5Z"
        fill="#3F3F46"
      />
      <path
        d="M88 105C88 101.686 90.6863 99 94 99H189C192.314 99 195 101.686 195 105C195 108.314 192.314 111 189 111H94C90.6863 111 88 108.314 88 105Z"
        fill="#27272A"
      />
      <path
        d="M88 51C88 46.5817 91.5817 43 96 43H221C225.418 43 229 46.5817 229 51V85C229 89.4183 225.418 93 221 93H96C91.5817 93 88 89.4183 88 85V51Z"
        fill="#27272A"
      />
      <path
        d="M17 48.5C17 45.4624 19.4624 43 22.5 43C25.5376 43 28 45.4624 28 48.5C28 51.5376 25.5376 54 22.5 54C19.4624 54 17 51.5376 17 48.5Z"
        fill="#27272A"
      />
      <path
        d="M17 66.5C17 63.4624 19.4624 61 22.5 61C25.5376 61 28 63.4624 28 66.5C28 69.5376 25.5376 72 22.5 72C19.4624 72 17 69.5376 17 66.5Z"
        fill="#27272A"
      />
      <path
        d="M17 86.5C17 83.4624 19.4624 81 22.5 81C25.5376 81 28 83.4624 28 86.5V87.5C28 90.5376 25.5376 93 22.5 93C19.4624 93 17 90.5376 17 87.5V86.5Z"
        fill="#27272A"
      />
      <path
        d="M32 25.5C32 22.4624 34.4624 20 37.5 20H67.5C70.5376 20 73 22.4624 73 25.5C73 28.5376 70.5376 31 67.5 31H37.5C34.4624 31 32 28.5376 32 25.5Z"
        fill="#3F3F46"
      />
      <path
        d="M32 66.5C32 63.4624 34.4624 61 37.5 61H67.5C70.5376 61 73 63.4624 73 66.5C73 69.5376 70.5376 72 67.5 72H37.5C34.4624 72 32 69.5376 32 66.5Z"
        fill="#27272A"
      />
      <path
        d="M32 87C32 83.6863 34.6863 81 38 81H67C70.3137 81 73 83.6863 73 87C73 90.3137 70.3137 93 67 93H38C34.6863 93 32 90.3137 32 87Z"
        fill="#27272A"
      />
      <circle cx="22.5" cy="25.5" fill="#3F3F46" r="5.5" />
    </>
  )
}

function ThemePreviewSystem(props: ThemePreviewSvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="System theme preview"
      {...props}
    >
      <defs>
        <clipPath id="systemDiagonalLight">
          <polygon points="0,0 240,0 0,117" />
        </clipPath>
        <clipPath id="systemDiagonalDark">
          <polygon points="240,0 240,117 0,117" />
        </clipPath>
      </defs>
      <g clip-path="url(#systemDiagonalLight)">
        <ThemePreviewLightPaths />
      </g>
      <g clip-path="url(#systemDiagonalDark)">
        <ThemePreviewDarkPaths />
      </g>
    </svg>
  )
}

function ThemePreviewLight(props: ThemePreviewSvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Light"
      {...props}
    >
      <ThemePreviewLightPaths />
    </svg>
  )
}

function ThemePreviewDark(props: ThemePreviewSvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dark"
      {...props}
    >
      <ThemePreviewDarkPaths />
    </svg>
  )
}

function ThemePreview(props: { mode: ThemeMode }) {
  if (props.mode === "light") {
    return <ThemePreviewLight class="aspect-[240/117] w-full rounded-md" />
  }

  if (props.mode === "dark") {
    return <ThemePreviewDark class="aspect-[240/117] w-full rounded-md" />
  }

  return <ThemePreviewSystem class="aspect-[240/117] w-full rounded-md" />
}

function AppearanceSettings() {
  const [theme, setTheme] = createSignal<ThemeMode>("system")

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

  const options = [
    { icon: Monitor, label: "System", value: "system" },
    { icon: Sun, label: "Light", value: "light" },
    { icon: Moon, label: "Dark", value: "dark" }
  ] as const

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">Appearance</h2>
      <Card>
        <CardContent class="grid gap-3 sm:grid-cols-3">
          <For each={options}>
            {(option) => {
              const Icon = option.icon

              return (
                <button
                  aria-pressed={theme() === option.value}
                  class={cn(
                    "rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                    theme() === option.value && "border-foreground"
                  )}
                  onClick={() => selectTheme(option.value)}
                  type="button"
                >
                  <div class="mb-3 flex items-center justify-between gap-2 text-sm font-medium">
                    <span class="flex items-center gap-2">
                      <Icon class="size-4 text-muted-foreground" />
                      {option.label}
                    </span>
                    <span
                      class={cn(
                        "size-3 rounded-full border",
                        theme() === option.value && "bg-foreground"
                      )}
                    />
                  </div>
                  <ThemePreview mode={option.value} />
                </button>
              )
            }}
          </For>
        </CardContent>
      </Card>
    </div>
  )
}

export function AccountSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const [name, setName] = createSignal("")
  const [isUploadingAvatar, setIsUploadingAvatar] = createSignal(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = createSignal(false)
  let avatarFileInput: HTMLInputElement | undefined
  const userId = () => props.session.data?.user.id
  const updateUser = createMutation(() => ({
    ...updateUserOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.profileUpdatedSuccess)
  }))
  const deviceSessions = createQuery(() => ({
    ...listDeviceSessionsOptions(
      auth.authClient as MultiSessionAuthClient,
      userId()
    ),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const username = () => getUsername(props.session)
  const displayName = () =>
    resolveUserLabel(
      props.session.data?.user.name,
      props.session.data?.user.email
    )

  const isProfilePending = () =>
    updateUser.isPending || isUploadingAvatar() || isDeletingAvatar()

  const submitProfile = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "")
    const usernameValue = String(formData.get("username") ?? "")

    updateUser.mutate({
      name,
      ...(username() ? { username: usernameValue } : {})
    } as Parameters<typeof updateUser.mutate>[0])
  }

  const handleAvatarFileChange = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]

    if (!file) return

    input.value = ""
    setIsUploadingAvatar(true)

    try {
      const resized =
        (await auth.avatar.resize?.(
          file,
          auth.avatar.size,
          auth.avatar.extension
        )) || file
      const image =
        (await auth.avatar.upload?.(resized)) || (await fileToBase64(resized))

      updateUser.mutate(
        { image },
        {
          onSuccess: () =>
            toast.success(auth.localization.settings.avatarChangedSuccess)
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const deleteAvatar = () => {
    const currentImage = props.session.data?.user.image

    updateUser.mutate(
      { image: null },
      {
        onSuccess: async () => {
          if (currentImage) {
            setIsDeletingAvatar(true)
            try {
              await auth.avatar.delete?.(currentImage)
            } finally {
              setIsDeletingAvatar(false)
            }
          }

          toast.success(auth.localization.settings.avatarDeletedSuccess)
        }
      }
    )
  }

  return (
    <div class="flex w-full flex-col gap-4 md:gap-6">
      <div>
        <h2 class="mb-3 text-sm font-semibold">Profile</h2>
        <form aria-label="Profile" onSubmit={submitProfile}>
          <Card>
            <CardContent class="flex flex-col gap-6">
              <div class="grid gap-2">
                <Label>{auth.localization.settings.avatar}</Label>
                <input
                  accept="image/*"
                  class="hidden"
                  onChange={handleAvatarFileChange}
                  ref={avatarFileInput}
                  type="file"
                />
                <div class="flex items-center gap-4">
                  <Button
                    class="h-auto w-auto rounded-full p-0"
                    disabled={isProfilePending()}
                    onClick={() => avatarFileInput?.click()}
                    type="button"
                    variant="ghost"
                  >
                    <Avatar class="size-18 rounded-full bg-muted text-muted-foreground">
                      <AvatarImage
                        alt={displayName()}
                        sizes="lg"
                        src={props.session.data?.user.image ?? undefined}
                      />
                      <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
                        {resolveUserInitials(
                          props.session.data?.user.name,
                          props.session.data?.user.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      as={Button}
                      class=""
                      disabled={!props.session.data || isProfilePending()}
                      size="sm"
                      variant="secondary"
                    >
                      {auth.localization.settings.changeAvatar}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="min-w-fit">
                      <DropdownMenuItem
                        onSelect={() => avatarFileInput?.click()}
                      >
                        <Upload class="text-muted-foreground" />
                        {auth.localization.settings.uploadAvatar}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!props.session.data?.user.image}
                        onSelect={deleteAvatar}
                        variant="destructive"
                      >
                        <Trash2 />
                        {auth.localization.settings.deleteAvatar}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div class="grid gap-2">
                <Label for="settings-name">{auth.localization.auth.name}</Label>
                <Input
                  autocomplete="name"
                  disabled={isProfilePending()}
                  id="settings-name"
                  name="name"
                  onInput={(event) => setName(event.currentTarget.value)}
                  placeholder={auth.localization.auth.name}
                  required
                  value={name() || (props.session.data?.user.name ?? "")}
                />
              </div>

              <div class="grid gap-2">
                <Label for="settings-username">Username</Label>
                <Input
                  autocomplete="username"
                  disabled={isProfilePending() || !username()}
                  id="settings-username"
                  name="username"
                  placeholder="Username"
                  value={username()}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                aria-label="Save changes"
                disabled={isProfilePending() || !props.session.data}
                size="sm"
                type="submit"
              >
                {auth.localization.settings.saveChanges}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div>
        <h2 class="mb-3 text-sm font-semibold">Change email</h2>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <div class="grid gap-2">
              <Label for="settings-email">Email</Label>
              <Input
                autocomplete="email"
                id="settings-email"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={props.session.data?.user.email ?? ""}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled size="sm" type="button">
              Update email
            </Button>
          </CardFooter>
        </Card>
        <SettingsUnavailableNotice>
          Change email mutation is not available in this Solid slice yet.
        </SettingsUnavailableNotice>
      </div>

      <AppearanceSettings />

      <div>
        <h2 class="mb-3 text-sm font-semibold">Manage accounts</h2>
        <Card>
          <CardContent class="p-0">
            <ItemGroup class="gap-0">
              <Item class="rounded-none p-4">
                <ItemMedia class="rounded-full bg-transparent">
                  <Avatar class="size-10 rounded-full bg-muted text-muted-foreground">
                    <AvatarImage
                      alt={displayName()}
                      src={props.session.data?.user.image ?? undefined}
                    />
                    <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
                      {resolveUserInitials(
                        props.session.data?.user.name,
                        props.session.data?.user.email
                      )}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Current session</ItemTitle>
                  <ItemDescription>
                    Signed in as {displayName()}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button disabled size="sm" type="button" variant="secondary">
                    Switch account
                  </Button>
                  <Button disabled size="sm" type="button" variant="secondary">
                    Sign out
                  </Button>
                </ItemActions>
              </Item>

              <For each={deviceSessions.data ?? []}>
                {(deviceSession) => (
                  <Show
                    when={
                      deviceSession.session.id !==
                      props.session.data?.session.id
                    }
                  >
                    <ItemSeparator />
                    <Item class="rounded-none p-4">
                      <ItemMedia class="rounded-full bg-transparent">
                        <Avatar class="size-10 rounded-full bg-muted text-muted-foreground">
                          <AvatarImage
                            alt={resolveUserLabel(
                              deviceSession.user.name,
                              deviceSession.user.email
                            )}
                            src={deviceSession.user.image ?? undefined}
                          />
                          <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
                            {resolveUserInitials(
                              deviceSession.user.name,
                              deviceSession.user.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {resolveUserLabel(
                            deviceSession.user.name,
                            deviceSession.user.email
                          )}
                        </ItemTitle>
                        <ItemDescription>Device session</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          disabled
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          Switch account
                        </Button>
                      </ItemActions>
                    </Item>
                  </Show>
                )}
              </For>
            </ItemGroup>
          </CardContent>
        </Card>
        <SettingsUnavailableNotice>
          Multi-session switch and sign-out actions are shown but disabled until
          their Solid settings UI is wired.
        </SettingsUnavailableNotice>
      </div>
    </div>
  )
}

export function SecuritySettings(props: { session: SettingsSession }) {
  const auth = useAuth()

  return (
    <div class="flex w-full flex-col gap-4 md:gap-6">
      <Show when={auth.emailAndPassword?.enabled}>
        <ChangePasswordSettings
          confirmPassword={auth.emailAndPassword.confirmPassword}
        />
      </Show>

      <Show when={!!auth.socialProviders?.length}>
        <LinkedAccountsSettings />
      </Show>

      <ActiveSessionsSettings session={props.session} />

      <Show when={hasAuthPlugin(auth.plugins, "apiKey")}>
        <ApiKeysSettings session={props.session} />
      </Show>

      <Show when={hasAuthPlugin(auth.plugins, "passkey")}>
        <PasskeysSettings session={props.session} />
      </Show>

      <Show when={hasAuthPlugin(auth.plugins, "deleteUser")}>
        <DangerZoneSettings />
      </Show>

      {auth.plugins.flatMap((plugin) => {
        const securityCards = plugin.securityCards as
          | SecurityCardsPlugin["securityCards"]
          | undefined

        return securityCards?.map((SecurityCard) => <SecurityCard />) ?? []
      })}
    </div>
  )
}

function ChangePasswordSettings(props: { confirmPassword?: boolean }) {
  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">Change password</h2>

      <Card>
        <CardContent class="flex flex-col gap-6">
          <div class="grid gap-2">
            <Label for="currentPassword">Current password</Label>
            <Input
              autocomplete="current-password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Current password"
              type="password"
            />
          </div>

          <div class="grid gap-2">
            <Label for="newPassword">New password</Label>
            <Input
              autocomplete="new-password"
              id="newPassword"
              name="newPassword"
              placeholder="New password"
              type="password"
            />
          </div>

          <Show when={props.confirmPassword}>
            <div class="grid gap-2">
              <Label for="confirmPassword">Confirm password</Label>
              <Input
                autocomplete="new-password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                type="password"
              />
            </div>
          </Show>
        </CardContent>

        <CardFooter>
          <Button disabled size="sm" type="button">
            Update password
          </Button>
        </CardFooter>
      </Card>

      <SettingsUnavailableNotice>
        Change password mutation is not wired in this Solid slice yet.
      </SettingsUnavailableNotice>
    </div>
  )
}

function LinkedAccountsSettings() {
  const auth = useAuth()

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">Linked accounts</h2>

      <Card class="p-0">
        <CardContent class="p-0">
          <For each={auth.socialProviders ?? []}>
            {(provider, index) => (
              <div
                class={cn(
                  "flex items-center justify-between gap-3 p-4 text-sm",
                  index() > 0 && "border-t"
                )}
              >
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Plug class="size-4.5 opacity-50" />
                  </div>
                  <div class="flex min-w-0 flex-col">
                    <span class="font-medium leading-tight">
                      {getProviderName(provider)}
                    </span>
                    <span class="truncate text-muted-foreground text-xs">
                      Link {getProviderName(provider)} account
                    </span>
                  </div>
                </div>

                <Button disabled size="sm" type="button" variant="outline">
                  <Link2 />
                  Link
                </Button>
              </div>
            )}
          </For>
        </CardContent>
      </Card>

      <SettingsUnavailableNotice>
        Social account linking controls are shown only when social providers are
        configured; link and unlink mutations are not wired in this Solid slice
        yet.
      </SettingsUnavailableNotice>
    </div>
  )
}

function ActiveSessionsSettings(props: { session: SettingsSession }) {
  const displayName = () =>
    resolveUserLabel(
      props.session.data?.user.name,
      props.session.data?.user.email
    )

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">Active sessions</h2>

      <Card class="p-0">
        <CardContent class="p-0">
          <ItemGroup class="gap-0">
            <Item class="rounded-none p-4">
              <ItemMedia>
                <Monitor class="size-4.5" />
              </ItemMedia>

              <ItemContent>
                <ItemTitle>Current session</ItemTitle>
                <ItemDescription class="flex flex-col gap-1">
                  <span class="w-fit rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                    Current session
                  </span>
                  <span class="truncate text-muted-foreground text-xs">
                    Signed in as {displayName()}
                  </span>
                </ItemDescription>
              </ItemContent>

              <ItemActions>
                <Button disabled size="sm" type="button" variant="outline">
                  <LogOut />
                  Sign out
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>

      <SettingsUnavailableNotice>
        Session revocation is not wired in this Solid slice yet.
      </SettingsUnavailableNotice>
    </div>
  )
}

function ApiKeysSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const apiKeys = createQuery(() => ({
    ...listApiKeysOptions(auth.authClient as ApiKeyAuthClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const keys = () => apiKeys.data?.apiKeys ?? []

  return (
    <div class="flex flex-col gap-3">
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">API keys</h2>
        <Button class="shrink-0" disabled size="sm" type="button">
          Create API key
        </Button>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            when={!apiKeys.isPending}
            fallback={
              <div class="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                Loading API keys…
              </div>
            }
          >
            <Show
              when={keys().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center gap-3 p-6 text-center text-sm">
                  <KeyRound class="size-6 text-muted-foreground" />
                  <div>
                    <p class="font-medium">No API keys</p>
                    <p class="text-muted-foreground">
                      Create an API key for programmatic access to your account.
                    </p>
                  </div>
                  <Button disabled size="sm" type="button" variant="secondary">
                    Create API key
                  </Button>
                </div>
              }
            >
              <For each={keys()}>
                {(apiKey, index) => (
                  <div
                    class={cn(
                      "flex items-center justify-between gap-3 p-4 text-sm",
                      index() > 0 && "border-t"
                    )}
                  >
                    <div>
                      <p class="font-medium">{apiKey.name ?? "API key"}</p>
                      <p class="text-muted-foreground text-xs">API key</p>
                    </div>
                    <Button disabled size="sm" type="button" variant="outline">
                      Revoke
                    </Button>
                  </div>
                )}
              </For>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function PasskeysSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const passkeys = createQuery(() => ({
    ...listPasskeysOptions(auth.authClient as PasskeyAuthClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const items = () => passkeys.data ?? []

  return (
    <div class="flex flex-col gap-3">
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">Passkeys</h2>
        <Button class="shrink-0" disabled size="sm" type="button">
          Add passkey
        </Button>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            when={!passkeys.isPending}
            fallback={
              <div class="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                Loading passkeys…
              </div>
            }
          >
            <Show
              when={items().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center gap-3 p-6 text-center text-sm">
                  <KeyRound class="size-6 text-muted-foreground" />
                  <div>
                    <p class="font-medium">No passkeys</p>
                    <p class="text-muted-foreground">
                      Create a passkey to securely access your account.
                    </p>
                  </div>
                  <Button disabled size="sm" type="button" variant="secondary">
                    Add passkey
                  </Button>
                </div>
              }
            >
              <For each={items()}>
                {(passkey, index) => (
                  <div
                    class={cn(
                      "flex items-center justify-between gap-3 p-4 text-sm",
                      index() > 0 && "border-t"
                    )}
                  >
                    <div>
                      <p class="font-medium">{passkey.name ?? "Passkey"}</p>
                      <p class="text-muted-foreground text-xs">Passkey</p>
                    </div>
                    <Button disabled size="sm" type="button" variant="outline">
                      Revoke
                    </Button>
                  </div>
                )}
              </For>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function DangerZoneSettings() {
  return (
    <div class="flex w-full flex-col">
      <h2 class="mb-3 text-sm font-semibold text-destructive">Danger zone</h2>

      <Card class="p-0">
        <CardContent class="flex items-center justify-between gap-3 p-4 text-sm">
          <div>
            <p class="font-medium">Delete user</p>
            <p class="text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button disabled size="sm" type="button" variant="destructive">
            Delete user
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function resolveSettingsRoute(path: string): SettingsRouteResolution {
  if (path === "account") {
    return { component: AccountSettings, title: "Account" }
  }

  if (path === "security") {
    return { component: SecuritySettings, title: "Security" }
  }

  return { redirectTo: "/" }
}

export function Settings(props: { class?: string; path: string }) {
  const auth = useAuth()
  const session = useSession(auth.authClient, {
    enabled: !import.meta.env.SSR
  })
  const currentView = createMemo(() => settingsPathViews()[props.path])
  const activeRoute = createMemo(() => resolveSettingsRoute(props.path))

  const handleSettingsTabChange = (nextView: string) => {
    if (nextView !== "account" && nextView !== "security") return

    auth.navigate({
      to: `${auth.basePaths.settings}/${auth.viewPaths.settings[nextView]}`
    })
  }

  createEffect(() => {
    if (import.meta.env.SSR || session.isPending || session.data) return

    const currentURL = window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)

    auth.navigate({
      replace: true,
      to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}?redirectTo=${redirectTo}`
    })
  })

  return (
    <div class={cn("w-full gap-4 md:gap-6", props.class)}>
      <Show
        when={!session.isPending && session.data}
        fallback={
          <p class="text-sm text-muted-foreground">Loading settings…</p>
        }
      >
        <Show when={!("redirectTo" in activeRoute())}>
          <Tabs
            aria-label={auth.localization.settings.settings}
            class="w-full gap-4 md:gap-6"
            onChange={handleSettingsTabChange}
            value={currentView()}
          >
            <div>
              <TabsList aria-label={auth.localization.settings.settings}>
                <TabsTrigger value="account">
                  {auth.localization.settings.account}
                </TabsTrigger>
                <TabsTrigger value="security">
                  {auth.localization.settings.security}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent tabIndex={-1} value="account">
              <AccountSettings session={session} />
            </TabsContent>
            <TabsContent tabIndex={-1} value="security">
              <SecuritySettings session={session} />
            </TabsContent>
          </Tabs>
        </Show>
      </Show>
    </div>
  )
}
