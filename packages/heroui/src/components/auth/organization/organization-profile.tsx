import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import {
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { ChangeOrganizationLogo } from "./change-organization-logo"
import { SlugField } from "./slug-field"

export type OrganizationProfileProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Profile card for the active organization: logo (when enabled), display name, and slug.
 */
export function OrganizationProfile({
  className,
  variant,
  ...props
}: OrganizationProfileProps & Omit<CardProps, "children">) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const [slug, setSlug] = useState(activeOrganization?.slug ?? "")

  useEffect(() => {
    setSlug(activeOrganization?.slug ?? "")
  }, [activeOrganization?.slug])

  const { mutate: commitOrganizationUpdate, isPending } = useUpdateOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () =>
        toast.success(organizationLocalization.organizationUpdatedSuccess)
    }
  )

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!activeOrganization) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    commitOrganizationUpdate({
      data: { name, slug }
    })
  }

  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <div>
      <h2 className={cn("mb-3 text-sm font-semibold")}>
        {organizationLocalization.organizationProfile}
      </h2>

      <Card className={cn(className)} variant={variant} {...props}>
        <Card.Content>
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ChangeOrganizationLogo />

            <TextField
              key={`${activeOrganization?.id}-${activeOrganization?.name}-name`}
              name="name"
              defaultValue={activeOrganization?.name}
              isDisabled={isPending || !activeOrganization}
            >
              <Label>{organizationLocalization.name}</Label>

              <Input
                className={cn(!activeOrganization && "hidden")}
                autoComplete="organization"
                placeholder={organizationLocalization.namePlaceholder}
                variant={inputVariant}
              />

              {!activeOrganization && (
                <Skeleton className="h-10 w-full rounded-xl md:h-9" />
              )}

              <FieldError />
            </TextField>

            {activeOrganization ? (
              <SlugField
                value={slug}
                onChange={setSlug}
                currentSlug={activeOrganization.slug}
                isDisabled={isPending}
                variant={inputVariant}
              />
            ) : (
              <TextField isDisabled>
                <Label>{organizationLocalization.slug}</Label>
                <Skeleton className="h-10 w-full rounded-xl md:h-9" />
              </TextField>
            )}

            <Button
              type="submit"
              isPending={isPending}
              isDisabled={!activeOrganization}
              size="sm"
              className="mt-1"
            >
              {isPending && <Spinner color="current" size="sm" />}

              {localization.settings.saveChanges}
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </div>
  )
}
