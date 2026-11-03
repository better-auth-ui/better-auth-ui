"use client"
import { fileToAvatarDataUrl } from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { Trash2, Upload } from "lucide-react"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/auth/user/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

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
      console.error("[Better Auth UI] Image operation failed", error)
      toast.error(localization.errors.imageUploadFailed)
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
    <Field className={className}>
      <FieldLabel>{localization.settings.avatar}</FieldLabel>

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
          variant="ghost"
          className="p-0 h-auto w-auto rounded-full"
          isDisabled={isPending}
          onPress={() => fileInputRef.current?.click()}
        >
          <UserAvatar className="size-12" isPending={isPending} />
        </Button>

        <DropdownMenuTrigger>
          <Button
            isDisabled={!session || isPending}
            variant="secondary"
            size="sm"
          >
            {isPending && <Spinner />}

            {localization.settings.changeAvatar}
          </Button>

          <DropdownMenu className="min-w-fit">
            <DropdownMenuItem onAction={() => fileInputRef.current?.click()}>
              <Upload className="text-muted-foreground" />

              {localization.settings.uploadAvatar}
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              isDisabled={!session?.user.image}
              onAction={handleDelete}
            >
              <Trash2 />

              {localization.settings.deleteAvatar}
            </DropdownMenuItem>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </div>
    </Field>
  )
}
