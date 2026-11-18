import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"

import { organizationPluginBase } from "../../../lib/auth/organization-plugin-base"
import { cn } from "../../../lib/cn"
import { prepareNativeImage } from "../../../lib/image"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Label } from "../../../primitives/field"
import { Menu } from "../../../primitives/menu"
import { Spinner } from "../../../primitives/spinner"
import { Box } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { Trash, Upload } from "../../../primitives/ui-icons"
import { OrganizationLogo } from "./organization-logo"
import { getErrorMessage } from "../../../lib/error-message"

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
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { logo, localization: organizationLocalization } = useAuthPlugin(
    organizationPluginBase
  )

  const colors = useThemeColors()

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)

  const { mutateAsync: updateOrganization, isPending: updatePending } =
    useUpdateOrganization(authClient)

  const permission = useHasPermission(authClient, {
    organizationId: activeOrganization?.id,
    permissions: { organization: ["update"] }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isPending = updatePending || isUploading || isDeleting

  async function handleUpload() {
    setMenuOpen(false)
    if (!activeOrganization || !permission.data?.success || isPending) return
    setIsUploading(true)
    try {
      const image = await prepareNativeImage(logo)
      if (image === null) return
      await updateOrganization({
        organizationId: activeOrganization.id,
        data: { logo: image }
      })
      toast.success(organizationLocalization.logoChangedSuccess)
    } catch (error) {
      toast.danger(getErrorMessage(error) ?? String(error))
    } finally {
      setIsUploading(false)
    }
  }
  async function handleDelete() {
    setMenuOpen(false)
    if (!activeOrganization || !permission.data?.success || isPending) return
    setIsDeleting(true)
    try {
      await updateOrganization({
        organizationId: activeOrganization.id,
        data: { logo: "" }
      })
      if (activeOrganization.logo) await logo.delete?.(activeOrganization.logo)
      toast.success(organizationLocalization.logoDeletedSuccess)
    } catch (error) {
      toast.danger(getErrorMessage(error) ?? String(error))
    } finally {
      setIsDeleting(false)
    }
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
          isDisabled={
            !activeOrganization || !permission.data?.success || isPending
          }
          onPress={() => void handleUpload()}
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
          isDisabled={
            !activeOrganization || !permission.data?.success || isPending
          }
          onPress={() => setMenuOpen(true)}
        >
          {isPending && <Spinner size="sm" color="current" />}
          {organizationLocalization.changeLogo}
        </Button>

        <Menu isOpen={menuOpen} onOpenChange={setMenuOpen}>
          <Menu.Item
            icon={<Upload width={18} height={18} color={colors.muted} />}
            onPress={() => void handleUpload()}
          >
            {organizationLocalization.uploadLogo}
          </Menu.Item>

          <Menu.Item
            icon={<Trash width={18} height={18} color={colors.danger} />}
            variant="danger"
            isDisabled={!activeOrganization?.logo}
            onPress={() => void handleDelete()}
          >
            {organizationLocalization.deleteLogo}
          </Menu.Item>
        </Menu>
      </Box>
    </Box>
  )
}
