import { fileToBase64 } from "@better-auth-ui/core"
import { updateUserOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Trash2, Upload } from "lucide-solid"
import { createSignal } from "solid-js"
import { toast } from "solid-sonner"
import {
  resolveUserInitials,
  resolveUserLabel
} from "@/components/auth/settings/shared/helpers"
import type { SettingsSession } from "@/components/auth/settings/shared/types"
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
import { Label } from "@/components/ui/label"

export function UserProfile(props: {
  session: SettingsSession
  username: string
}) {
  const auth = useAuth()
  const [name, setName] = createSignal("")
  const [isUploadingAvatar, setIsUploadingAvatar] = createSignal(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = createSignal(false)
  let avatarFileInput: HTMLInputElement | undefined
  const updateUser = createMutation(() => ({
    ...updateUserOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.profileUpdatedSuccess)
  }))
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
      ...(props.username ? { username: usernameValue } : {})
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
                    <DropdownMenuItem onSelect={() => avatarFileInput?.click()}>
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
                disabled={isProfilePending() || !props.username}
                id="settings-username"
                name="username"
                placeholder="Username"
                value={props.username}
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
  )
}
