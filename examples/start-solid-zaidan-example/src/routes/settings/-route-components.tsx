import {
  fileToBase64,
  getProviderName,
  type SettingsView
} from "@better-auth-ui/core"
import {
  apiKeyLocalization,
  multiSessionLocalization,
  passkeyLocalization
} from "@better-auth-ui/core/plugins"
import {
  type AccountInfoParams,
  type ApiKeyAuthClient,
  accountInfoOptions,
  addPasskeyOptions,
  changeEmailOptions,
  changePasswordOptions,
  createApiKeyOptions,
  deleteApiKeyOptions,
  deletePasskeyOptions,
  type ListApiKeysData,
  type ListDeviceSessionsData,
  type ListSession,
  linkSocialOptions,
  listAccountsOptions,
  listApiKeysOptions,
  listDeviceSessionsOptions,
  listPasskeysOptions,
  listSessionsOptions,
  type MultiSessionAuthClient,
  type PasskeyAuthClient,
  requestPasswordResetOptions,
  revokeMultiSessionOptions,
  revokeSessionOptions,
  setActiveSessionOptions,
  unlinkAccountOptions,
  updateUserOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import Bowser from "bowser"
import {
  ArrowLeftRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  Fingerprint,
  Key,
  Link2,
  Link2Off,
  LogOut,
  Monitor,
  Moon,
  MoreHorizontal,
  Plug,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  X
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
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

type ChangePasswordFieldErrors = {
  confirmPassword?: string
  currentPassword?: string
  newPassword?: string
}

type LinkedAccount = {
  accountId?: string
  id: string
  providerId: string
}

type LinkedProvider = Parameters<typeof getProviderName>[0]

type DeviceSession = NonNullable<
  ListDeviceSessionsData<MultiSessionAuthClient>
>[number]

type ListedApiKey = NonNullable<
  ListApiKeysData<ApiKeyAuthClient>
>["apiKeys"][number]

type ListedPasskey = {
  id: string
  name?: string | null
  createdAt: Date | string
}

type AccountInfoResponse = {
  data?: {
    login?: string | null
    username?: string | null
  } | null
  user?: {
    email?: string | null
    name?: string | null
  } | null
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

function timeAgo(date: Date | string) {
  const createdAt = date instanceof Date ? date : new Date(date)
  const seconds = Math.floor((Date.now() - createdAt.getTime()) / 1000)
  const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto"
  })

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1]
  ]

  for (const [unit, threshold] of units) {
    if (seconds >= threshold) {
      return relativeTimeFormat.format(-Math.floor(seconds / threshold), unit)
    }
  }

  return relativeTimeFormat.format(0, "second")
}

export function shouldLoadLinkedAccounts(props: {
  isSsr: boolean
  userId?: string
}) {
  return !props.isSsr && Boolean(props.userId)
}

export const shouldLoadDeviceSessions = shouldLoadLinkedAccounts

export const shouldLoadAccounts = shouldLoadLinkedAccounts

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
  const [emailFieldError, setEmailFieldError] = createSignal<string>()
  const [isUploadingAvatar, setIsUploadingAvatar] = createSignal(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = createSignal(false)
  let avatarFileInput: HTMLInputElement | undefined
  const userId = () => props.session.data?.user.id
  const updateUser = createMutation(() => ({
    ...updateUserOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.profileUpdatedSuccess)
  }))
  const changeEmail = createMutation(() => ({
    ...changeEmailOptions(auth.authClient),
    onSuccess: () => toast.success("Email updated successfully")
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
  const setActiveSession = createMutation(() => ({
    ...setActiveSessionOptions(auth.authClient as MultiSessionAuthClient),
    onSuccess: () => window.scrollTo({ top: 0 })
  }))
  const revokeMultiSession = createMutation(() => ({
    ...revokeMultiSessionOptions(auth.authClient as MultiSessionAuthClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.revokeSessionSuccess)
  }))
  const username = () => getUsername(props.session)
  const displayName = () =>
    resolveUserLabel(
      props.session.data?.user.name,
      props.session.data?.user.email
    )

  const isProfilePending = () =>
    updateUser.isPending || isUploadingAvatar() || isDeletingAvatar()
  const isAccountActionPending = () =>
    setActiveSession.isPending || revokeMultiSession.isPending
  const otherDeviceSessions = () => {
    const sessions = (deviceSessions.data ?? []) as DeviceSession[]

    return sessions.filter(
      (deviceSession) =>
        deviceSession.session.id !== props.session.data?.session.id
    )
  }

  const switchToSession = (deviceSession: DeviceSession) => {
    setActiveSession.mutate({
      sessionToken: deviceSession.session.token
    } as Parameters<typeof setActiveSession.mutate>[0])
  }

  const signOutSession = (deviceSession: DeviceSession) => {
    revokeMultiSession.mutate({
      sessionToken: deviceSession.session.token
    } as Parameters<typeof revokeMultiSession.mutate>[0])
  }

  const submitChangeEmail = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)

    changeEmail.mutate({
      callbackURL: `${auth.baseURL}/${auth.viewPaths.settings.account}`,
      newEmail: String(formData.get("email") ?? "")
    } as Parameters<typeof changeEmail.mutate>[0])
  }

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
        <h2 class="mb-3 text-sm font-semibold">
          {auth.localization.settings.changeEmail}
        </h2>
        <form onSubmit={submitChangeEmail}>
          <Card>
            <CardContent class="flex flex-col gap-6">
              <div class="grid gap-2">
                <Label for="settings-email">
                  {auth.localization.auth.email}
                </Label>
                <Input
                  aria-invalid={!!emailFieldError()}
                  autocomplete="email"
                  disabled={changeEmail.isPending || !props.session.data}
                  id="settings-email"
                  name="email"
                  onInput={() => setEmailFieldError(undefined)}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setEmailFieldError(event.currentTarget.validationMessage)
                  }}
                  placeholder={auth.localization.auth.emailPlaceholder}
                  required
                  type="email"
                  value={props.session.data?.user.email ?? ""}
                />
                <Show when={emailFieldError()}>
                  {(message) => (
                    <p class="text-destructive text-sm">{message()}</p>
                  )}
                </Show>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={changeEmail.isPending || !props.session.data}
                size="sm"
                type="submit"
              >
                {auth.localization.settings.updateEmail}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <AppearanceSettings />

      <div>
        <h2 class="mb-3 text-sm font-semibold">
          {multiSessionLocalization.manageAccounts}
        </h2>
        <Card class="p-0">
          <CardContent class="p-0">
            <ItemGroup class="gap-0">
              <ManageAccountRow
                description={`Signed in as ${displayName()}`}
                image={props.session.data?.user.image}
                isBusy={isAccountActionPending()}
                isCurrentSession
                name={props.session.data?.user.name}
                email={props.session.data?.user.email}
                onSignOut={() => {
                  const currentSession = props.session.data

                  if (currentSession) {
                    signOutSession(currentSession as DeviceSession)
                  }
                }}
              />

              <For each={otherDeviceSessions()}>
                {(deviceSession) => (
                  <>
                    <ItemSeparator />
                    <ManageAccountRow
                      description="Device session"
                      email={deviceSession.user.email}
                      image={deviceSession.user.image}
                      isBusy={isAccountActionPending()}
                      name={deviceSession.user.name}
                      onSignOut={() => signOutSession(deviceSession)}
                      onSwitch={() => switchToSession(deviceSession)}
                    />
                  </>
                )}
              </For>

              <Show when={deviceSessions.isPending}>
                <ItemSeparator />
                <ManageAccountRowSkeleton />
              </Show>
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ManageAccountRow(props: {
  description: string
  email?: string | null
  image?: string | null
  isBusy: boolean
  isCurrentSession?: boolean
  name?: string | null
  onSignOut: () => void
  onSwitch?: () => void
}) {
  const auth = useAuth()
  const label = () => resolveUserLabel(props.name, props.email)

  return (
    <Item class="rounded-none p-0">
      <ItemMedia class="rounded-full bg-transparent">
        <Avatar class="size-10 rounded-full bg-muted text-muted-foreground">
          <AvatarImage alt={label()} src={props.image ?? undefined} />
          <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
            {resolveUserInitials(props.name, props.email)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent class="p-0">
        <ItemTitle>
          <Show fallback={label()} when={props.isCurrentSession}>
            {props.name ? props.name : null}
          </Show>
        </ItemTitle>
        <ItemDescription>{props.email}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Show
          fallback={
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                class="shrink-0"
                disabled={props.isBusy}
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal class="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent class="min-w-fit">
                <DropdownMenuItem onSelect={props.onSwitch}>
                  <ArrowLeftRight class="text-muted-foreground" />
                  {multiSessionLocalization.switchAccount}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={props.onSignOut}>
                  <LogOut class="text-muted-foreground" />
                  {auth.localization.auth.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          when={props.isCurrentSession}
        >
          <Button
            class="shrink-0"
            disabled={props.isBusy}
            onClick={props.onSignOut}
            size="sm"
            type="button"
            variant="outline"
          >
            <LogOut class="size-4" />
            {auth.localization.auth.signOut}
          </Button>
        </Show>
      </ItemActions>
    </Item>
  )
}

function ManageAccountRowSkeleton() {
  return (
    <Item class="rounded-none p-0">
      <ItemMedia class="rounded-full bg-transparent">
        <Skeleton class="size-10 rounded-full" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-3 w-20" />
      </ItemContent>
      <ItemActions>
        <Skeleton class="h-8 w-8 rounded-md" />
      </ItemActions>
    </Item>
  )
}

export function SecuritySettings(props: { session: SettingsSession }) {
  const auth = useAuth()

  return (
    <div class="flex w-full flex-col gap-4 md:gap-6">
      <Show when={auth.emailAndPassword?.enabled}>
        <ChangePasswordSettings
          confirmPassword={auth.emailAndPassword.confirmPassword}
          session={props.session}
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

function ChangePasswordSkeletonInput() {
  return (
    <Skeleton>
      <Input class="invisible" />
    </Skeleton>
  )
}

function ChangePasswordSettings(props: {
  confirmPassword?: boolean
  session: SettingsSession
}) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const linkedAccounts = createQuery(() => ({
    ...listAccountsOptions(auth.authClient, userId()),
    enabled: shouldLoadAccounts({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const hasCredentialAccount = () =>
    linkedAccounts.data?.some(
      (account: { providerId?: string }) => account.providerId === "credential"
    )
  const requestPasswordReset = createMutation(() => ({
    ...requestPasswordResetOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.auth.passwordResetEmailSent)
  }))
  const changePassword = createMutation(() => ({
    ...changePasswordOptions(auth.authClient),
    onError: (error) => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.error(error.error?.message || error.message)
    },
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success(auth.localization.settings.changePasswordSuccess)
    }
  }))
  const [currentPassword, setCurrentPassword] = createSignal("")
  const [newPassword, setNewPassword] = createSignal("")
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [isNewPasswordVisible, setIsNewPasswordVisible] = createSignal(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    createSignal(false)
  const [fieldErrors, setFieldErrors] = createSignal<ChangePasswordFieldErrors>(
    {}
  )

  const setPasswordFieldError = (
    field: keyof ChangePasswordFieldErrors,
    message?: string
  ) => {
    setFieldErrors((previous) => ({ ...previous, [field]: message }))
  }

  const resetPasswordFields = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const sendResetLink = () => {
    if (!props.session.data) return

    requestPasswordReset.mutate({
      email: props.session.data.user.email
    } as Parameters<typeof requestPasswordReset.mutate>[0])
  }

  const submitChangePassword = (event: SubmitEvent) => {
    event.preventDefault()

    if (props.confirmPassword && newPassword() !== confirmPassword()) {
      resetPasswordFields()
      toast.error(auth.localization.auth.passwordsDoNotMatch)
      return
    }

    changePassword.mutate({
      currentPassword: currentPassword(),
      newPassword: newPassword(),
      revokeOtherSessions: true
    } as Parameters<typeof changePassword.mutate>[0])
  }

  const isPasswordPending = () =>
    changePassword.isPending || requestPasswordReset.isPending

  if (!linkedAccounts.isPending && !hasCredentialAccount()) {
    return (
      <div>
        <h2 class="mb-3 text-sm font-semibold">
          {auth.localization.settings.changePassword}
        </h2>

        <Card>
          <CardContent class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium text-sm leading-tight">
                {auth.localization.settings.setPassword}
              </p>
              <p class="mt-0.5 text-muted-foreground text-xs">
                {auth.localization.settings.setPasswordDescription}
              </p>
            </div>

            <Button
              disabled={requestPasswordReset.isPending || !props.session.data}
              onClick={sendResetLink}
              size="sm"
              type="button"
            >
              {requestPasswordReset.isPending
                ? `${auth.localization.auth.sendResetLink}…`
                : auth.localization.auth.sendResetLink}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.changePassword}
      </h2>

      <form onSubmit={submitChangePassword}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <div class="grid gap-2">
              <Label for="currentPassword">
                {auth.localization.settings.currentPassword}
              </Label>
              <Show
                fallback={<ChangePasswordSkeletonInput />}
                when={props.session.data && !linkedAccounts.isPending}
              >
                <Input
                  aria-invalid={!!fieldErrors().currentPassword}
                  autocomplete="current-password"
                  disabled={isPasswordPending()}
                  id="currentPassword"
                  name="currentPassword"
                  onInput={(event) => {
                    setCurrentPassword(event.currentTarget.value)
                    setPasswordFieldError("currentPassword")
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setPasswordFieldError(
                      "currentPassword",
                      event.currentTarget.validationMessage
                    )
                  }}
                  placeholder={
                    auth.localization.settings.currentPasswordPlaceholder
                  }
                  required
                  type="password"
                  value={currentPassword()}
                />
              </Show>
              <Show when={fieldErrors().currentPassword}>
                {(message) => (
                  <p class="text-destructive text-sm" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>

            <div class="grid gap-2">
              <Label for="newPassword">
                {auth.localization.auth.newPassword}
              </Label>
              <Show
                fallback={<ChangePasswordSkeletonInput />}
                when={props.session.data && !linkedAccounts.isPending}
              >
                <div class="relative">
                  <Input
                    aria-invalid={!!fieldErrors().newPassword}
                    autocomplete="new-password"
                    class="pr-12"
                    disabled={isPasswordPending()}
                    id="newPassword"
                    maxLength={auth.emailAndPassword.maxPasswordLength}
                    minLength={auth.emailAndPassword.minPasswordLength}
                    name="newPassword"
                    onInput={(event) => {
                      setNewPassword(event.currentTarget.value)
                      setPasswordFieldError("newPassword")
                    }}
                    onInvalid={(event) => {
                      event.preventDefault()
                      setPasswordFieldError(
                        "newPassword",
                        event.currentTarget.validationMessage
                      )
                    }}
                    placeholder={auth.localization.auth.newPasswordPlaceholder}
                    required
                    type={isNewPasswordVisible() ? "text" : "password"}
                    value={newPassword()}
                  />
                  <Button
                    aria-label={
                      isNewPasswordVisible()
                        ? auth.localization.auth.hidePassword
                        : auth.localization.auth.showPassword
                    }
                    class="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={isPasswordPending()}
                    onClick={() =>
                      setIsNewPasswordVisible((visible) => !visible)
                    }
                    size="icon-sm"
                    title={
                      isNewPasswordVisible()
                        ? auth.localization.auth.hidePassword
                        : auth.localization.auth.showPassword
                    }
                    type="button"
                    variant="ghost"
                  >
                    {isNewPasswordVisible() ? (
                      <EyeOff aria-hidden class="size-4" />
                    ) : (
                      <Eye aria-hidden class="size-4" />
                    )}
                  </Button>
                </div>
              </Show>
              <Show when={fieldErrors().newPassword}>
                {(message) => (
                  <p class="text-destructive text-sm" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>

            <Show when={props.confirmPassword}>
              <div class="grid gap-2">
                <Label for="confirmPassword">
                  {auth.localization.auth.confirmPassword}
                </Label>
                <Show
                  fallback={<ChangePasswordSkeletonInput />}
                  when={props.session.data && !linkedAccounts.isPending}
                >
                  <div class="relative">
                    <Input
                      aria-invalid={!!fieldErrors().confirmPassword}
                      autocomplete="new-password"
                      class="pr-12"
                      disabled={isPasswordPending()}
                      id="confirmPassword"
                      maxLength={auth.emailAndPassword.maxPasswordLength}
                      minLength={auth.emailAndPassword.minPasswordLength}
                      name="confirmPassword"
                      onInput={(event) => {
                        setConfirmPassword(event.currentTarget.value)
                        setPasswordFieldError("confirmPassword")
                      }}
                      onInvalid={(event) => {
                        event.preventDefault()
                        setPasswordFieldError(
                          "confirmPassword",
                          event.currentTarget.validationMessage
                        )
                      }}
                      placeholder={
                        auth.localization.auth.confirmPasswordPlaceholder
                      }
                      required
                      type={isConfirmPasswordVisible() ? "text" : "password"}
                      value={confirmPassword()}
                    />
                    <Button
                      aria-label={
                        isConfirmPasswordVisible()
                          ? auth.localization.auth.hidePassword
                          : auth.localization.auth.showPassword
                      }
                      class="absolute right-1 top-1/2 -translate-y-1/2"
                      disabled={isPasswordPending()}
                      onClick={() =>
                        setIsConfirmPasswordVisible((visible) => !visible)
                      }
                      size="icon-sm"
                      title={
                        isConfirmPasswordVisible()
                          ? auth.localization.auth.hidePassword
                          : auth.localization.auth.showPassword
                      }
                      type="button"
                      variant="ghost"
                    >
                      {isConfirmPasswordVisible() ? (
                        <EyeOff aria-hidden class="size-4" />
                      ) : (
                        <Eye aria-hidden class="size-4" />
                      )}
                    </Button>
                  </div>
                </Show>
                <Show when={fieldErrors().confirmPassword}>
                  {(message) => (
                    <p class="text-destructive text-sm" role="alert">
                      {message()}
                    </p>
                  )}
                </Show>
              </div>
            </Show>
          </CardContent>

          <CardFooter>
            <Button
              disabled={isPasswordPending() || !props.session.data}
              size="sm"
              type="submit"
            >
              {changePassword.isPending
                ? `${auth.localization.settings.updatePassword}…`
                : auth.localization.settings.updatePassword}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

function LinkedAccountsSettings() {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const linkedAccounts = createQuery(() => ({
    ...listAccountsOptions(auth.authClient, userId()),
    enabled: shouldLoadLinkedAccounts({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const socialProviders = () => auth.socialProviders ?? []
  const accountRows = () => {
    const linked = (linkedAccounts.data ?? [])
      .filter(
        (account: { providerId?: string }) =>
          account.providerId !== "credential"
      )
      .map((account: LinkedAccount) => ({
        account,
        key: account.id,
        provider: account.providerId as LinkedProvider
      }))

    return [
      ...linked,
      ...socialProviders().map((provider) => ({
        account: undefined,
        key: provider,
        provider: provider as LinkedProvider
      }))
    ]
  }

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.linkedAccounts}
      </h2>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            fallback={
              <For each={socialProviders()}>
                {(_, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <LinkedAccountRowSkeleton />
                  </>
                )}
              </For>
            }
            when={!linkedAccounts.isPending}
          >
            <For each={accountRows()}>
              {(row, index) => (
                <>
                  <Show when={index() > 0}>
                    <ItemSeparator />
                  </Show>
                  <LinkedAccountRow
                    account={row.account}
                    provider={row.provider}
                    userId={userId()}
                  />
                </>
              )}
            </For>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function LinkedAccountRow(props: {
  account?: LinkedAccount
  provider: LinkedProvider
  userId?: string
}) {
  const auth = useAuth()
  const providerName = () => getProviderName(props.provider)
  const accountInfo = createQuery(() => ({
    ...accountInfoOptions(auth.authClient, props.userId, {
      query: { accountId: props.account?.accountId }
    } as AccountInfoParams<typeof auth.authClient>),
    enabled: Boolean(props.userId && props.account?.accountId)
  }))
  const linkSocial = createMutation(() => ({
    ...linkSocialOptions(auth.authClient)
  }))
  const unlinkAccount = createMutation(() => ({
    ...unlinkAccountOptions(auth.authClient),
    onSuccess: () => toast.success(auth.localization.settings.accountUnlinked)
  }))
  const accountInfoData = () =>
    accountInfo.data as AccountInfoResponse | undefined
  const displayName = () =>
    accountInfoData()?.data?.login ||
    accountInfoData()?.data?.username ||
    accountInfoData()?.user?.email ||
    accountInfoData()?.user?.name ||
    props.account?.accountId
  const linkProviderLabel = () =>
    auth.localization.settings.linkProvider.replace(
      "{{provider}}",
      providerName()
    )
  const unlinkProviderLabel = () =>
    auth.localization.settings.unlinkProvider.replace(
      "{{provider}}",
      providerName()
    )
  const linkProvider = () => {
    linkSocial.mutate({
      callbackURL: `${auth.baseURL}${window.location.pathname}`,
      provider: props.provider
    } as Parameters<typeof linkSocial.mutate>[0])
  }
  const unlinkProvider = (account: LinkedAccount) => {
    unlinkAccount.mutate({
      providerId: account.providerId
    } as Parameters<typeof unlinkAccount.mutate>[0])
  }

  return (
    <div class="flex items-center justify-between gap-3 p-4 text-sm">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Plug class={cn("size-4.5", !props.account && "opacity-50")} />
        </div>
        <div class="flex min-w-0 flex-col">
          <span class="font-medium leading-tight">{providerName()}</span>
          <Show
            fallback={
              <span class="truncate text-muted-foreground text-xs">
                {props.account ? displayName() : linkProviderLabel()}
              </span>
            }
            when={props.account && accountInfo.isPending}
          >
            <Skeleton class="my-0.5 h-3 w-24" />
          </Show>
        </div>
      </div>

      <Show
        fallback={
          <Button
            aria-label={linkProviderLabel()}
            class="ml-auto shrink-0"
            disabled={linkSocial.isPending}
            onClick={linkProvider}
            size="sm"
            type="button"
            variant="outline"
          >
            <Link2 />
            {auth.localization.settings.link}
          </Button>
        }
        when={props.account}
      >
        {(account) => (
          <Button
            aria-label={unlinkProviderLabel()}
            class="ml-auto shrink-0"
            disabled={unlinkAccount.isPending}
            onClick={() => unlinkProvider(account())}
            size="sm"
            type="button"
            variant="outline"
          >
            <Link2Off />
            {auth.localization.settings.unlinkProvider
              .replace("{{provider}}", "")
              .trim()}
          </Button>
        )}
      </Show>
    </div>
  )
}

function LinkedAccountRowSkeleton() {
  return (
    <div class="flex items-center gap-3 p-4">
      <Skeleton class="size-10 rounded-md" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}

function ActiveSessionsSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const activeSessions = createQuery(() => ({
    ...listSessionsOptions(auth.authClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const sessions = () =>
    [...(activeSessions.data ?? [])].sort((activeSession) =>
      activeSession.id === props.session.data?.session.id ? -1 : 1
    )
  const revokeSession = createMutation(() => ({
    ...revokeSessionOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.revokeSessionSuccess)
  }))
  const displayName = () =>
    resolveUserLabel(
      props.session.data?.user.name,
      props.session.data?.user.email
    )

  const signOut = () => {
    auth.navigate({
      to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signOut}`
    })
  }

  const revoke = (activeSession: ListSession) => {
    revokeSession.mutate(activeSession)
  }

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.activeSessions}
      </h2>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            fallback={<ActiveSessionRowSkeleton />}
            when={!activeSessions.isPending && props.session.data}
          >
            <ItemGroup class="gap-0">
              <For each={sessions()}>
                {(activeSession, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <ActiveSessionRow
                      activeSession={activeSession}
                      displayName={displayName()}
                      isRevoking={revokeSession.isPending}
                      isCurrentSession={
                        activeSession.token ===
                        props.session.data?.session.token
                      }
                      onRevoke={revoke}
                      onSignOut={signOut}
                    />
                  </>
                )}
              </For>
            </ItemGroup>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function ActiveSessionRow(props: {
  activeSession: ListSession
  displayName: string
  isCurrentSession: boolean
  isRevoking: boolean
  onRevoke: (activeSession: ListSession) => void
  onSignOut: () => void
}) {
  const auth = useAuth()
  const userAgent = createMemo(() =>
    Bowser.parse(props.activeSession.userAgent || "")
  )
  const isMobile = () =>
    userAgent().platform.type === "mobile" ||
    userAgent().platform.type === "tablet"
  const browserAndOs = () => {
    const browser = userAgent().browser.name || "Unknown Browser"
    const os = userAgent().os.name

    return os ? `${browser}, ${os}` : browser
  }

  return (
    <Item class="rounded-none p-0">
      <ItemMedia>
        <Show
          fallback={<Monitor class="size-4.5 text-white" />}
          when={isMobile()}
        >
          <Smartphone class="size-4.5 text-white" />
        </Show>
      </ItemMedia>

      <ItemContent class="p-0">
        <ItemTitle>{browserAndOs()}</ItemTitle>
        <ItemDescription class="flex flex-col gap-1">
          <Show
            fallback={
              <Show when={props.activeSession.createdAt}>
                <span class="truncate text-white text-xs capitalize">
                  {timeAgo(props.activeSession.createdAt)}
                </span>
              </Show>
            }
            when={props.isCurrentSession}
          >
            <span class="w-fit rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
              {auth.localization.settings.currentSession}
            </span>
          </Show>
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <Button
          aria-label={
            props.isCurrentSession
              ? auth.localization.auth.signOut
              : auth.localization.settings.revokeSession
          }
          disabled={props.isRevoking}
          onClick={() =>
            props.isCurrentSession
              ? props.onSignOut()
              : props.onRevoke(props.activeSession)
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Show fallback={<X class="size-4" />} when={props.isCurrentSession}>
            <LogOut class="size-4" />
          </Show>
          {props.isCurrentSession
            ? auth.localization.auth.signOut
            : auth.localization.settings.revoke}
        </Button>
      </ItemActions>
    </Item>
  )
}

function ActiveSessionRowSkeleton() {
  return (
    <Item class="rounded-none p-4">
      <ItemMedia>
        <Skeleton class="size-10 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-3 w-32" />
      </ItemContent>
    </Item>
  )
}

function ApiKeysSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false)
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
        <h2 class="truncate text-sm font-semibold">
          {apiKeyLocalization.apiKeys}
        </h2>
        <Dialog
          open={isCreateDialogOpen()}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogTrigger
            as={Button}
            class="shrink-0"
            disabled={apiKeys.isPending}
            size="sm"
          >
            {apiKeyLocalization.createApiKey}
          </DialogTrigger>
          <CreateApiKeyDialog onOpenChange={setIsCreateDialogOpen} />
        </Dialog>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show when={!apiKeys.isPending} fallback={<ApiKeySkeleton />}>
            <Show
              when={keys().length > 0}
              fallback={
                <ApiKeysEmpty
                  onCreatePress={() => setIsCreateDialogOpen(true)}
                />
              }
            >
              <For each={keys()}>
                {(apiKey, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <ApiKeyRow apiKey={apiKey as ListedApiKey} />
                  </>
                )}
              </For>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function ApiKeySkeleton() {
  return (
    <div class="flex items-center gap-3 p-4">
      <Skeleton class="size-10 rounded-md" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-3 w-36" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}

function ApiKeysEmpty(props: { onCreatePress: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div class="flex size-10 items-center justify-center rounded-md bg-muted">
        <Key class="size-4.5" />
      </div>

      <div class="flex flex-col items-center justify-center gap-1">
        <p class="font-semibold text-sm">{apiKeyLocalization.noApiKeys}</p>
        <p class="text-muted-foreground text-xs">
          {apiKeyLocalization.apiKeysDescription}
        </p>
      </div>

      <Button onClick={props.onCreatePress} size="sm" type="button">
        {apiKeyLocalization.createApiKey}
      </Button>
    </div>
  )
}

function ApiKeyRow(props: { apiKey: ListedApiKey }) {
  const auth = useAuth()
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const preview = () => `${props.apiKey.start}${"*".repeat(16)}`

  return (
    <div class="flex items-center gap-3 p-0">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Key class="size-4.5" />
      </div>

      <div class="flex min-w-0 flex-col">
        <span class="truncate font-medium text-sm leading-tight">
          {props.apiKey.name || apiKeyLocalization.apiKey}
        </span>
        <span class="truncate font-mono text-muted-foreground text-xs">
          {preview()}
        </span>
        <span class="text-muted-foreground text-xs">
          {new Date(props.apiKey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      <Dialog open={deleteOpen()} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          as={Button}
          aria-label={apiKeyLocalization.deleteApiKey}
          class="ml-auto shrink-0"
          size="sm"
          variant="outline"
        >
          <X />
          {auth.localization.settings.delete}
        </DialogTrigger>
        <DeleteApiKeyDialog
          apiKey={props.apiKey}
          onOpenChange={setDeleteOpen}
        />
      </Dialog>
    </div>
  )
}

function CreateApiKeyDialog(props: { onOpenChange: (open: boolean) => void }) {
  const auth = useAuth()
  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = createSignal(false)
  const [newApiKeyName, setNewApiKeyName] = createSignal<string | null>(null)
  const [newApiKeySecret, setNewApiKeySecret] = createSignal<string | null>(
    null
  )
  const createApiKey = createMutation(() => ({
    ...createApiKeyOptions(auth.authClient as ApiKeyAuthClient),
    onSuccess: (result) => {
      props.onOpenChange(false)
      setNewApiKeyName(result.name ?? null)
      setNewApiKeySecret(result.key)
      setIsNewKeyDialogOpen(true)
    }
  }))

  const submitCreateApiKey = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "").trim()

    createApiKey.mutate(
      (name ? { name } : undefined) as Parameters<typeof createApiKey.mutate>[0]
    )
  }

  return (
    <>
      <DialogContent>
        <form class="flex flex-col gap-6" onSubmit={submitCreateApiKey}>
          <DialogHeader>
            <div class="flex size-10 items-center justify-center rounded-md bg-muted">
              <Key class="size-4.5" />
            </div>
            <DialogTitle>{apiKeyLocalization.createApiKey}</DialogTitle>
            <DialogDescription>
              {apiKeyLocalization.apiKeysDescription}
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-2">
            <Label for="api-key-name">{apiKeyLocalization.name}</Label>
            <Input
              autofocus
              disabled={createApiKey.isPending}
              id="api-key-name"
              name="name"
              placeholder={auth.localization.settings.optional}
            />
          </div>

          <DialogFooter>
            <DialogClose
              as={Button}
              disabled={createApiKey.isPending}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
            <Button disabled={createApiKey.isPending} type="submit">
              {createApiKey.isPending
                ? `${apiKeyLocalization.createApiKey}…`
                : apiKeyLocalization.createApiKey}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={isNewKeyDialogOpen()} onOpenChange={setIsNewKeyDialogOpen}>
        <NewApiKeyDialog name={newApiKeyName()} secretKey={newApiKeySecret()} />
      </Dialog>
    </>
  )
}

function NewApiKeyDialog(props: {
  name: string | null
  secretKey: string | null
}) {
  const auth = useAuth()
  const [isCopied, setIsCopied] = createSignal(false)

  const copySecretKey = async () => {
    if (!props.secretKey) return

    try {
      await navigator.clipboard.writeText(props.secretKey)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Key class="size-4.5" />
        </div>
        <DialogTitle>{apiKeyLocalization.newApiKey}</DialogTitle>
        <DialogDescription>
          {apiKeyLocalization.newApiKeyWarning}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-2">
        <Label for="new-api-key-secret">
          {props.name || apiKeyLocalization.apiKey}
        </Label>
        <div class="flex rounded-md border bg-background">
          <Input
            class="rounded-r-none border-0 font-mono text-xs"
            id="new-api-key-secret"
            readonly
            value={props.secretKey ?? ""}
          />
          <Button
            aria-label={auth.localization.settings.copyToClipboard}
            onClick={copySecretKey}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <Show fallback={<Copy />} when={isCopied()}>
              <Check />
            </Show>
          </Button>
        </div>
      </div>

      <DialogFooter>
        <DialogClose as={Button}>
          {apiKeyLocalization.dismissNewKey}
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

function DeleteApiKeyDialog(props: {
  apiKey: ListedApiKey
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const preview = () => `${props.apiKey.start}${"*".repeat(16)}`
  const previewId = () => `delete-api-key-preview-${props.apiKey.id}`
  const deleteApiKey = createMutation(() => ({
    ...deleteApiKeyOptions(auth.authClient as ApiKeyAuthClient),
    onSuccess: () => props.onOpenChange(false)
  }))

  const deleteKey = () => {
    deleteApiKey.mutate({
      keyId: props.apiKey.id
    } as Parameters<typeof deleteApiKey.mutate>[0])
  }

  return (
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Key class="size-4.5" />
        </div>
        <DialogTitle>{apiKeyLocalization.deleteApiKey}</DialogTitle>
        <DialogDescription>
          {apiKeyLocalization.deleteApiKeyWarning}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2">
        <Label for={previewId()}>
          {props.apiKey.name || apiKeyLocalization.apiKey}
        </Label>
        <Input
          class="font-mono text-xs"
          disabled
          id={previewId()}
          readonly
          value={preview()}
        />
      </div>

      <DialogFooter>
        <DialogClose
          as={Button}
          disabled={deleteApiKey.isPending}
          type="button"
          variant="outline"
        >
          {auth.localization.settings.cancel}
        </DialogClose>
        <Button
          disabled={deleteApiKey.isPending}
          onClick={deleteKey}
          type="button"
          variant="destructive"
        >
          {deleteApiKey.isPending
            ? `${apiKeyLocalization.deleteApiKey}…`
            : apiKeyLocalization.deleteApiKey}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function PasskeysSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const [isAddDialogOpen, setIsAddDialogOpen] = createSignal(false)
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
        <h2 class="truncate text-sm font-semibold">
          {passkeyLocalization.passkeys}
        </h2>
        <Dialog open={isAddDialogOpen()} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger
            as={Button}
            class="shrink-0"
            disabled={passkeys.isPending}
            size="sm"
          >
            {passkeyLocalization.addPasskey}
          </DialogTrigger>
          <AddPasskeyDialog
            onOpenChange={setIsAddDialogOpen}
            onPasskeyAdded={() => passkeys.refetch()}
          />
        </Dialog>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show when={!passkeys.isPending} fallback={<PasskeySkeleton />}>
            <Show
              when={items().length > 0}
              fallback={
                <PasskeysEmpty onAddPress={() => setIsAddDialogOpen(true)} />
              }
            >
              <For each={items()}>
                {(passkey, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <PasskeyRow passkey={passkey as ListedPasskey} />
                  </>
                )}
              </For>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function PasskeySkeleton() {
  return (
    <div class="flex items-center gap-3 p-4">
      <Skeleton class="size-10 rounded-md" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}

function PasskeysEmpty(props: { onAddPress: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div class="flex size-10 items-center justify-center rounded-md bg-muted">
        <Fingerprint class="size-4.5" />
      </div>

      <div class="flex flex-col items-center justify-center gap-1">
        <p class="font-semibold text-sm">{passkeyLocalization.noPasskeys}</p>
        <p class="text-muted-foreground text-xs">
          {passkeyLocalization.passkeysDescription}
        </p>
      </div>

      <Button onClick={props.onAddPress} size="sm" type="button">
        {passkeyLocalization.addPasskey}
      </Button>
    </div>
  )
}

function PasskeyRow(props: { passkey: ListedPasskey }) {
  const auth = useAuth()
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const passkeyName = () => props.passkey.name || passkeyLocalization.passkey

  return (
    <div class="flex items-center gap-3 p-4 text-sm">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Fingerprint class="size-4.5" />
      </div>

      <div class="flex min-w-0 flex-col">
        <span class="truncate font-medium leading-tight">{passkeyName()}</span>
        <span class="text-muted-foreground text-xs">
          {new Date(props.passkey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      <Dialog open={deleteOpen()} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          as={Button}
          aria-label={passkeyLocalization.deletePasskey.replace(
            "{{name}}",
            passkeyName()
          )}
          class="ml-auto shrink-0"
          size="sm"
          variant="outline"
        >
          <X />
          {auth.localization.settings.delete}
        </DialogTrigger>
        <DeletePasskeyDialog
          onOpenChange={setDeleteOpen}
          passkey={props.passkey}
        />
      </Dialog>
    </div>
  )
}

function AddPasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  onPasskeyAdded: () => void
}) {
  const auth = useAuth()
  const addPasskey = createMutation(() => ({
    ...addPasskeyOptions(auth.authClient as PasskeyAuthClient),
    onSuccess: () => {
      props.onOpenChange(false)
      props.onPasskeyAdded()
    }
  }))

  const submitAddPasskey = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "").trim()

    addPasskey.mutate(
      (name ? { name } : undefined) as Parameters<typeof addPasskey.mutate>[0]
    )
  }

  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submitAddPasskey}>
        <DialogHeader>
          <div class="flex size-10 items-center justify-center rounded-md bg-muted">
            <Fingerprint class="size-4.5" />
          </div>
          <DialogTitle>{passkeyLocalization.addPasskey}</DialogTitle>
          <DialogDescription>
            {passkeyLocalization.passkeysDescription}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-2">
          <Label for="passkey-name">{passkeyLocalization.name}</Label>
          <Input
            autofocus
            disabled={addPasskey.isPending}
            id="passkey-name"
            name="name"
            placeholder={auth.localization.settings.optional}
          />
        </div>

        <DialogFooter>
          <DialogClose
            as={Button}
            disabled={addPasskey.isPending}
            type="button"
            variant="outline"
          >
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button disabled={addPasskey.isPending} type="submit">
            {addPasskey.isPending
              ? `${passkeyLocalization.addPasskey}…`
              : passkeyLocalization.addPasskey}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function DeletePasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}) {
  const auth = useAuth()
  const passkeyName = () => props.passkey.name || passkeyLocalization.passkey
  const previewId = () => `delete-passkey-preview-${props.passkey.id}`
  const deletePasskey = createMutation(() => ({
    ...deletePasskeyOptions(auth.authClient as PasskeyAuthClient),
    onSuccess: () => props.onOpenChange(false)
  }))

  const deleteKey = () => {
    deletePasskey.mutate({
      id: props.passkey.id
    } as Parameters<typeof deletePasskey.mutate>[0])
  }

  return (
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Fingerprint class="size-4.5" />
        </div>
        <DialogTitle>{passkeyLocalization.deletePasskeyTitle}</DialogTitle>
        <DialogDescription>
          {passkeyLocalization.deletePasskeyWarning}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2">
        <Label for={previewId()}>{passkeyName()}</Label>
        <Input disabled id={previewId()} readonly value={passkeyName()} />
      </div>

      <DialogFooter>
        <DialogClose
          as={Button}
          disabled={deletePasskey.isPending}
          type="button"
          variant="outline"
        >
          {auth.localization.settings.cancel}
        </DialogClose>
        <Button
          disabled={deletePasskey.isPending}
          onClick={deleteKey}
          type="button"
          variant="destructive"
        >
          {deletePasskey.isPending
            ? `${passkeyLocalization.deletePasskeyTitle}…`
            : passkeyLocalization.deletePasskeyTitle}
        </Button>
      </DialogFooter>
    </DialogContent>
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
