import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { useState } from "react"
import { cn } from "../../../../lib/cn"
import { pickImage, resizeImage } from "../../../../lib/image"
import { useThemeColors } from "../../../../lib/theme-colors"
import { Button } from "../../../../primitives/button"
import { Label } from "../../../../primitives/field"
import { Menu } from "../../../../primitives/menu"
import { Spinner } from "../../../../primitives/spinner"
import { Box, Btn } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"
import { Trash, Upload } from "../../../../primitives/ui-icons"
import { UserAvatar } from "../../user/user-avatar"

export type ChangeAvatarProps = {
  className?: string
}

/**
 * Current-avatar control: tapping the avatar or "Change avatar" opens a menu
 * with Upload / Delete. Mirrors the heroui `ChangeAvatar`, adapted for React
 * Native: there is no `<input type="file">`, so "Upload" calls `pickImage()`
 * (system image library) then `resizeImage(uri)` (square-crop + PNG data URI)
 * and passes the resulting data URI straight to `updateUser` — no
 * `avatar.resize`/`avatar.upload`/`fileToBase64` (all DOM-only) in the loop.
 * The Upload/Delete affordance itself reuses the `Menu` primitive (the same
 * Modal-bottom-sheet pattern as `UserButton`'s menu) instead of a web
 * `Dropdown`.
 */
export function ChangeAvatar({ className }: ChangeAvatarProps) {
  const { authClient, localization, avatar } = useAuth()
  const { data: session } = useSession(authClient)
  const colors = useThemeColors()

  const { mutate: updateUser, isPending: updatePending } =
    useUpdateUser(authClient)

  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isPending = updatePending || isUploading || isDeleting

  async function handleUpload() {
    setIsUploading(true)

    try {
      const picked = await pickImage()
      if (!picked) {
        setIsUploading(false)
        return
      }

      const image = await resizeImage(picked.uri)

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
    <Box className={cn("gap-1", className)}>
      <Label isDisabled={!session}>{localization.settings.avatar}</Label>

      <Box className="flex-row items-center gap-4">
        <Btn
          disabled={!session || isPending}
          onPress={handleUpload}
          className="rounded-full"
        >
          <UserAvatar size="lg" isPending={isPending} />
        </Btn>

        <Button
          isDisabled={!session || isPending}
          size="sm"
          variant="secondary"
          onPress={() => setMenuOpen(true)}
        >
          {isPending && <Spinner size="sm" />}
          {localization.settings.changeAvatar}
        </Button>

        <Menu isOpen={menuOpen} onOpenChange={setMenuOpen}>
          <Menu.Item
            icon={<Upload width={18} height={18} color={colors.muted} />}
            onPress={handleUpload}
          >
            {localization.settings.uploadAvatar}
          </Menu.Item>

          <Menu.Item
            icon={<Trash width={18} height={18} color={colors.danger} />}
            isDisabled={!session?.user.image}
            onPress={handleDelete}
            variant="danger"
          >
            {localization.settings.deleteAvatar}
          </Menu.Item>
        </Menu>
      </Box>
    </Box>
  )
}
