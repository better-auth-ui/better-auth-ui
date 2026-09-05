import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { cn } from "../../../lib/cn"
import { pickImage, resizeImage } from "../../../lib/image"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Label } from "../../../primitives/field"
import { Menu } from "../../../primitives/menu"
import { Spinner } from "../../../primitives/spinner"
import { Box } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { Trash, Upload } from "../../../primitives/ui-icons"
import { OrganizationLogo } from "./organization-logo"

export type ChangeOrganizationLogoProps = {
  className?: string
}

/**
 * Organization logo upload/delete control: an avatar trigger (opens the
 * upload picker directly) plus a "Change logo" button that opens a menu with
 * explicit upload/delete rows. Mirrors the heroui `ChangeOrganizationLogo`,
 * adapted for React Native: the hidden `<input type="file">` + ref-click
 * becomes `pickImage()`/`resizeImage()`, and the `Dropdown` popover becomes
 * the shared `Menu` bottom sheet.
 */
export function ChangeOrganizationLogo({
  className
}: ChangeOrganizationLogoProps) {
  const { authClient } = useAuth()
  const { logo, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const colors = useThemeColors()

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)

  const { mutate: updateOrganization, isPending: updatePending } =
    useUpdateOrganization(authClient as OrganizationAuthClient)

  const [menuOpen, setMenuOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isPending = updatePending || isUploading || isDeleting

  async function handleUpload() {
    setMenuOpen(false)
    if (!activeOrganization) return

    const picked = await pickImage()
    if (!picked) return

    setIsUploading(true)

    try {
      const image = await resizeImage(picked.uri, logo.size)

      updateOrganization(
        { data: { logo: image } },
        {
          onSuccess: () =>
            toast.success(organizationLocalization.logoChangedSuccess),
          onSettled: () => setIsUploading(false)
        }
      )
    } catch (error) {
      setIsUploading(false)
      if (error instanceof Error) {
        toast.danger(error.message)
      }
    }
  }

  async function handleDelete() {
    setMenuOpen(false)

    const currentLogo = activeOrganization?.logo

    updateOrganization(
      { data: { logo: "" } },
      {
        onSuccess: async () => {
          if (!currentLogo) {
            toast.success(organizationLocalization.logoDeletedSuccess)
            return
          }

          setIsDeleting(true)
          try {
            await logo.delete?.(currentLogo)
            toast.success(organizationLocalization.logoDeletedSuccess)
          } catch (error) {
            if (error instanceof Error) {
              toast.danger(error.message)
            }
          } finally {
            setIsDeleting(false)
          }
        }
      }
    )
  }

  if (!logo.enabled) {
    return null
  }

  return (
    <Box className={cn("gap-1.5", className)}>
      <Label isDisabled={!activeOrganization}>
        {organizationLocalization.logo}
      </Label>

      <Box className="flex-row items-center gap-4">
        <Button
          variant="ghost"
          isIconOnly
          className="h-auto w-auto rounded-full p-0"
          isDisabled={!activeOrganization || isPending}
          onPress={handleUpload}
        >
          <OrganizationLogo
            size="lg"
            isPending={activeOrganizationPending}
            organization={activeOrganization ?? undefined}
          />
        </Button>

        <Button
          size="sm"
          variant="secondary"
          isDisabled={!activeOrganization || isPending}
          onPress={() => setMenuOpen(true)}
        >
          {isPending && <Spinner size="sm" color="current" />}
          {organizationLocalization.changeLogo}
        </Button>

        <Menu isOpen={menuOpen} onOpenChange={setMenuOpen}>
          <Menu.Item
            icon={<Upload width={18} height={18} color={colors.muted} />}
            onPress={handleUpload}
          >
            {organizationLocalization.uploadLogo}
          </Menu.Item>

          <Menu.Item
            icon={<Trash width={18} height={18} color={colors.danger} />}
            variant="danger"
            isDisabled={!activeOrganization?.logo}
            onPress={handleDelete}
          >
            {organizationLocalization.deleteLogo}
          </Menu.Item>
        </Menu>
      </Box>
    </Box>
  )
}
