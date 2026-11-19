import { fileToBase64 } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { CloudArrowUpIn, TrashBin } from "@gravity-ui/icons"
import { Button, cn, Dropdown, Label, Spinner, toast } from "@heroui/react"
import { type ChangeEvent, useRef, useState } from "react"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { OrganizationLogo } from "./organization-logo"

export type ChangeOrganizationLogoProps = {
  className?: string
}

export function ChangeOrganizationLogo({
  className
}: ChangeOrganizationLogoProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const { logo, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)
  const canUpdate = useHasPermission(authClient, {
    permissions: { organization: ["update"] }
  })

  const { mutate: updateOrganization, isPending: updatePending } =
    useUpdateOrganization(authClient)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isPending = updatePending || isUploading || isDeleting

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activeOrganization || !canUpdate.data?.success) return

    e.target.value = ""

    setIsUploading(true)

    try {
      const resized = await logo.resize(file, logo.size, logo.extension)

      const image =
        (await logo.upload?.(resized)) || (await fileToBase64(resized))

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
      console.error("[Better Auth UI] Image operation failed", error)
      toast.danger(localization.errors.imageUploadFailed)
    }
  }

  function handleDelete() {
    if (!canUpdate.data?.success) return
    const currentLogo = activeOrganization?.logo

    updateOrganization(
      {
        data: { logo: "" }
      },
      {
        onSuccess: () => {
          void (async () => {
            if (!currentLogo) {
              toast.success(organizationLocalization.logoDeletedSuccess)
              return
            }

            setIsDeleting(true)
            try {
              await logo.delete?.(currentLogo)
              toast.success(organizationLocalization.logoDeletedSuccess)
            } catch (error) {
              console.error("[Better Auth UI] Image operation failed", error)
              toast.danger(localization.errors.imageDeleteFailed)
            } finally {
              setIsDeleting(false)
            }
          })()
        }
      }
    )
  }

  if (!logo.enabled) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label isDisabled={!activeOrganization}>
        {organizationLocalization.logo}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      <div className="flex items-center gap-4">
        {canUpdate.data?.success ? (
          <Button
            type="button"
            isIconOnly
            variant="ghost"
            className="p-0 h-auto w-auto rounded-full"
            isDisabled={!activeOrganization || isPending}
            onPress={() => fileInputRef.current?.click()}
          >
            <OrganizationLogo
              size="lg"
              isPending={activeOrganizationPending}
              organization={activeOrganization}
            />
          </Button>
        ) : (
          <OrganizationLogo
            size="lg"
            isPending={activeOrganizationPending}
            organization={activeOrganization}
          />
        )}

        {(canUpdate.isPending || canUpdate.data?.success) && (
          <Dropdown>
            <Button
              isDisabled={
                !activeOrganization || isPending || canUpdate.isPending
              }
              size="sm"
              variant="secondary"
            >
              {isPending && <Spinner size="sm" />}

              {organizationLocalization.changeLogo}
            </Button>

            <Dropdown.Popover className="min-w-fit">
              <Dropdown.Menu>
                <Dropdown.Item
                  textValue={organizationLocalization.uploadLogo}
                  onAction={() => fileInputRef.current?.click()}
                >
                  <CloudArrowUpIn className="text-muted" />

                  <Label>{organizationLocalization.uploadLogo}</Label>
                </Dropdown.Item>

                <Dropdown.Item
                  textValue={organizationLocalization.deleteLogo}
                  isDisabled={!activeOrganization?.logo}
                  onAction={() => handleDelete()}
                  variant="danger"
                >
                  <TrashBin className="text-danger" />

                  <Label>{organizationLocalization.deleteLogo}</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        )}
      </div>
    </div>
  )
}
