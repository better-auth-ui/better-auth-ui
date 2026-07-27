import { fileToAvatarDataUrl } from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { CloudArrowUpIn, TrashBin } from "@gravity-ui/icons"
import { Button, cn, Dropdown, Label, Spinner, toast } from "@heroui/react"
import { type ChangeEvent, useRef, useState } from "react"

import { UserAvatar } from "../../user/user-avatar"

export type ChangeAvatarProps = {
  className?: string
}

export function ChangeAvatar({ className }: ChangeAvatarProps) {
  const { authClient, localization, avatar } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutate: updateUser, isPending: updatePending } =
    useUpdateUser(authClient)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isPending = updatePending || isUploading || isDeleting

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""

    setIsUploading(true)

    try {
      const resized =
        (await avatar.resize?.(file, avatar.size, avatar.extension)) || file

      const image =
        (await avatar.upload?.(resized)) || (await fileToAvatarDataUrl(resized))

      updateUser(
        { image },
        {
          onSuccess: () =>
            toast.success(localization.settings.avatarChangedSuccess)
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message)
      }
    }

    setIsUploading(false)
  }

  async function handleDelete() {
    const currentImage = session?.user.image

    updateUser(
      { image: null },
      {
        onSuccess: async () => {
          if (currentImage) {
            setIsDeleting(true)
            try {
              await avatar.delete?.(currentImage)
            } finally {
              setIsDeleting(false)
            }
          }

          toast.success(localization.settings.avatarDeletedSuccess)
        }
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label isDisabled={!session}>{localization.settings.avatar}</Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-4">
        <Button
          type="button"
          isIconOnly
          variant="ghost"
          className="p-0 h-auto w-auto rounded-full"
          isDisabled={!session || isPending}
          onPress={() => fileInputRef.current?.click()}
        >
          <UserAvatar size="lg" isPending={isPending} />
        </Button>

        <Dropdown>
          <Button
            isDisabled={!session || isPending}
            size="sm"
            variant="secondary"
          >
            {isPending && <Spinner size="sm" />}

            {localization.settings.changeAvatar}
          </Button>

          <Dropdown.Popover className="min-w-fit">
            <Dropdown.Menu>
              <Dropdown.Item
                textValue={localization.settings.uploadAvatar}
                onAction={() => fileInputRef.current?.click()}
              >
                <CloudArrowUpIn className="text-muted" />

                <Label>{localization.settings.uploadAvatar}</Label>
              </Dropdown.Item>

              <Dropdown.Item
                textValue={localization.settings.deleteAvatar}
                isDisabled={!session?.user.image}
                onAction={handleDelete}
                variant="danger"
              >
                <TrashBin className="text-danger" />

                <Label>{localization.settings.deleteAvatar}</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </div>
  )
}
