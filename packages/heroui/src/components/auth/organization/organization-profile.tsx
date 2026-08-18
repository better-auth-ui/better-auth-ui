import { parseAdditionalFieldValue } from "@better-auth-ui/core"
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
import { AdditionalField } from "../additional-field"
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
  const { additionalFields, localization: organizationLocalization } =
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

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!activeOrganization) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const additionalValues: Record<string, unknown> = {}
    try {
      for (const field of additionalFields) {
        const value = parseAdditionalFieldValue(
          field,
          formData.get(field.name) as string | null
        )
        await field.validate?.(value)
        if (value !== undefined) additionalValues[field.name] = value
      }
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : String(error))
      return
    }

    commitOrganizationUpdate({
      data: { name, slug, ...additionalValues }
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
            {activeOrganization &&
              additionalFields.map((field) => (
                <AdditionalField
                  field={{
                    ...field,
                    defaultValue: (
                      activeOrganization as Record<string, unknown>
                    )[field.name] as never
                  }}
                  isPending={isPending}
                  key={field.name}
                  name={field.name}
                  optionalLabel={localization.settings.optional}
                  variant={variant}
                />
              ))}

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
