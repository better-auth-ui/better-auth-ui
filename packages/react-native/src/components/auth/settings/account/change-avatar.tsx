import { useNativeAvatar } from "../../../../lib/native-avatar"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { useState } from "react"
import { cn } from "../../../../lib/cn"
import { prepareNativeImage } from "../../../../lib/image"
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

/** Pick, optimize, upload, and remove the current user avatar. */
export function ChangeAvatar({ className }: ChangeAvatarProps) {
  const { authClient, localization } = useAuth()
  const avatar = useNativeAvatar()
  const { data: session } = useSession(authClient)
  const colors = useThemeColors()

  const { mutateAsync: updateUser, isPending: updatePending } =
    useUpdateUser(authClient)

  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isPending = updatePending || isUploading || isDeleting

  async function handleUpload() {
    setIsUploading(true)

    try {
      const image = await prepareNativeImage(avatar)
      if (!image) {
        setIsUploading(false)
        return
      }

      await updateUser(
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

    setIsDeleting(true)
    try {
      await updateUser({ image: null })
      if (currentImage) await avatar.delete?.(currentImage)
      toast.success(localization.settings.avatarDeletedSuccess)
    } catch (error) {
      if (error instanceof Error) toast.danger(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!avatar.enabled) return null

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
