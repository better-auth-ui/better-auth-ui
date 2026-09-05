import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useCheckSlug,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { useDebouncer } from "@tanstack/react-pacer"
import { useEffect, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { pickImage, resizeImage } from "../../../lib/image"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { Form } from "../../../primitives/form"
import { Input, InputGroup } from "../../../primitives/input"
import { Menu } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Spinner } from "../../../primitives/spinner"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { Check, Trash, Upload, Xmark } from "../../../primitives/ui-icons"
import { OrganizationLogo } from "./organization-logo"

export type OrganizationProfileProps = SettingsViewProps

/**
 * Sanitize a slug value so it only contains lowercase alphanumeric characters
 * and dashes. Runs of disallowed characters are collapsed to a single dash,
 * mirroring the heroui `sanitizeSlug` helper from `slug-field.tsx`.
 */
function sanitizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

/**
 * Profile card for the active organization: logo (when enabled), display
 * name, and slug. Mirrors the heroui `OrganizationProfile`, adapted for React
 * Native: the `div`/`h2` shell becomes `View`/`Text`, the name field is
 * controlled state (no `FormData`), the logo upload uses `pickImage`/
 * `resizeImage` instead of a hidden `<input type="file">`, and the change/
 * delete logo affordance uses the shared `Menu` bottom sheet instead of a
 * `Dropdown` popover.
 */
export function OrganizationProfile({
  className,
  variant
}: OrganizationProfileProps) {
  const { authClient, localization } = useAuth()
  const {
    localization: organizationLocalization,
    logo,
    checkSlug: checkSlugEnabled
  } = useAuthPlugin(organizationPlugin)

  const colors = useThemeColors()

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)

  const [name, setName] = useState(activeOrganization?.name ?? "")
  const [slug, setSlug] = useState(activeOrganization?.slug ?? "")

  useEffect(() => {
    setName(activeOrganization?.name ?? "")
    setSlug(activeOrganization?.slug ?? "")
  }, [activeOrganization?.name, activeOrganization?.slug])

  const { mutate: commitOrganizationUpdate, isPending: isSavePending } =
    useUpdateOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () =>
        toast.success(organizationLocalization.organizationUpdatedSuccess)
    })

  const { mutate: updateLogo, isPending: isLogoPending } =
    useUpdateOrganization(authClient as OrganizationAuthClient)

  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    reset: resetCheckSlug
  } = useCheckSlug(authClient as OrganizationAuthClient)

  const debouncer = useDebouncer(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed || trimmed === activeOrganization?.slug) return

      checkSlug({ slug: trimmed })
    },
    { wait: 500 }
  )

  function handleSlugChange(next: string) {
    const sanitized = sanitizeSlug(next)
    setSlug(sanitized)
    resetCheckSlug()

    if (checkSlugEnabled) {
      debouncer.maybeExecute(sanitized)
    }
  }

  function handleSubmit() {
    if (!activeOrganization) return

    commitOrganizationUpdate({
      data: { name, slug }
    })
  }

  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDeletingLogo, setIsDeletingLogo] = useState(false)

  const isLogoBusy = isLogoPending || isUploadingLogo || isDeletingLogo

  async function handleUploadLogo() {
    setLogoMenuOpen(false)
    if (!activeOrganization) return

    const picked = await pickImage()
    if (!picked) return

    setIsUploadingLogo(true)

    try {
      const image = await resizeImage(picked.uri, logo.size)

      updateLogo(
        { data: { logo: image } },
        {
          onSuccess: () =>
            toast.success(organizationLocalization.logoChangedSuccess),
          onSettled: () => setIsUploadingLogo(false)
        }
      )
    } catch (error) {
      setIsUploadingLogo(false)
      if (error instanceof Error) {
        toast.danger(error.message)
      }
    }
  }

  async function handleDeleteLogo() {
    setLogoMenuOpen(false)

    const currentLogo = activeOrganization?.logo

    updateLogo(
      { data: { logo: "" } },
      {
        onSuccess: async () => {
          if (!currentLogo) {
            toast.success(organizationLocalization.logoDeletedSuccess)
            return
          }

          setIsDeletingLogo(true)
          try {
            await logo.delete?.(currentLogo)
            toast.success(organizationLocalization.logoDeletedSuccess)
          } catch (error) {
            if (error instanceof Error) {
              toast.danger(error.message)
            }
          } finally {
            setIsDeletingLogo(false)
          }
        }
      }
    )
  }

  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  const isCheckingSlug =
    !!slug.trim() && slug.trim() !== activeOrganization?.slug

  return (
    <Box className={cn(className)}>
      <Txt className="mb-3 text-sm font-semibold text-foreground">
        {organizationLocalization.organizationProfile}
      </Txt>

      <Card variant={variant}>
        <Card.Content>
          <Form onSubmit={handleSubmit} className="gap-4">
            {logo.enabled && (
              <Box className="gap-1.5">
                <Label isDisabled={!activeOrganization}>
                  {organizationLocalization.logo}
                </Label>

                <Box className="flex-row items-center gap-4">
                  <Button
                    variant="ghost"
                    isIconOnly
                    className="h-auto w-auto rounded-full p-0"
                    isDisabled={!activeOrganization || isLogoBusy}
                    onPress={handleUploadLogo}
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
                    isDisabled={!activeOrganization || isLogoBusy}
                    onPress={() => setLogoMenuOpen(true)}
                  >
                    {isLogoBusy && <Spinner size="sm" color="current" />}
                    {organizationLocalization.changeLogo}
                  </Button>

                  <Menu isOpen={logoMenuOpen} onOpenChange={setLogoMenuOpen}>
                    <Menu.Item
                      icon={
                        <Upload width={18} height={18} color={colors.muted} />
                      }
                      onPress={handleUploadLogo}
                    >
                      {organizationLocalization.uploadLogo}
                    </Menu.Item>

                    <Menu.Item
                      icon={
                        <Trash width={18} height={18} color={colors.danger} />
                      }
                      variant="danger"
                      isDisabled={!activeOrganization?.logo}
                      onPress={handleDeleteLogo}
                    >
                      {organizationLocalization.deleteLogo}
                    </Menu.Item>
                  </Menu>
                </Box>
              </Box>
            )}

            <TextField
              key={`${activeOrganization?.id}-name`}
              name="name"
              autoComplete="name"
              isDisabled={isSavePending || !activeOrganization}
              value={name}
              onChange={setName}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
              }}
            >
              <Label>{organizationLocalization.name}</Label>

              {activeOrganization ? (
                <Input
                  placeholder={organizationLocalization.namePlaceholder}
                  variant={inputVariant}
                  required
                />
              ) : (
                <Skeleton className="h-11 w-full rounded-lg" />
              )}

              <FieldError />
            </TextField>

            {activeOrganization ? (
              <TextField
                key={`${activeOrganization.id}-slug`}
                name="slug"
                isDisabled={isSavePending}
                value={slug}
                onChange={handleSlugChange}
                validate={(value) => {
                  if (!value) return localization.auth.fieldRequired
                }}
              >
                <Label>{organizationLocalization.slug}</Label>

                <InputGroup variant={inputVariant}>
                  <InputGroup.Input
                    placeholder={organizationLocalization.slugPlaceholder}
                    required
                  />

                  {isCheckingSlug && (
                    <InputGroup.Suffix>
                      {checkSlugData?.status ? (
                        <Check width={16} height={16} color={colors.accent} />
                      ) : checkSlugError ? (
                        <Xmark width={16} height={16} color={colors.danger} />
                      ) : (
                        <Spinner size="sm" />
                      )}
                    </InputGroup.Suffix>
                  )}
                </InputGroup>

                <FieldError />
              </TextField>
            ) : (
              <TextField isDisabled>
                <Label>{organizationLocalization.slug}</Label>
                <Skeleton className="h-11 w-full rounded-lg" />
              </TextField>
            )}

            <Button
              type="submit"
              isPending={isSavePending}
              isDisabled={!activeOrganization}
              size="sm"
              className="mt-1"
            >
              {localization.settings.saveChanges}
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </Box>
  )
}
