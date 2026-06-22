import { fileToBase64 } from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/solid"
import { Trash2, Upload } from "lucide-solid"
import { createSignal } from "solid-js"
import { toast } from "solid-sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { resolveUserInitials, resolveUserLabel } from "../shared/helpers"

export type ChangeAvatarProps = {
  className?: string
}

export function ChangeAvatar(props: ChangeAvatarProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const [isUploadingAvatar, setIsUploadingAvatar] = createSignal(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = createSignal(false)
  let avatarFileInput: HTMLInputElement | undefined
  const updateUser = useUpdateUser(auth.authClient)
  const displayName = () =>
    resolveUserLabel(session.data?.user.name, session.data?.user.email)
  const isPending = () =>
    updateUser.isPending || isUploadingAvatar() || isDeletingAvatar()

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
    const currentImage = session.data?.user.image

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
    <div class={props.className ?? "grid gap-2"}>
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
          disabled={isPending()}
          onClick={() => avatarFileInput?.click()}
          type="button"
          variant="ghost"
        >
          <Avatar class="size-18 rounded-full bg-muted text-muted-foreground">
            <AvatarImage
              alt={displayName()}
              sizes="lg"
              src={session.data?.user.image ?? undefined}
            />
            <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
              {resolveUserInitials(
                session.data?.user.name,
                session.data?.user.email
              )}
            </AvatarFallback>
          </Avatar>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            as={Button}
            class=""
            disabled={!session.data || isPending()}
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
              disabled={!session.data?.user.image}
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
  )
}
