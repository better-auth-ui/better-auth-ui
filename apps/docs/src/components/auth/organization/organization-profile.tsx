"use client"

import { parseAdditionalFieldValue } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { type SyntheticEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { AdditionalField } from "../additional-field"
import { ChangeOrganizationLogo } from "./change-organization-logo"
import { SlugField } from "./slug-field"

export type OrganizationProfileProps = {
  className?: string
}

/**
 * Profile card for the active organization: logo (when enabled), display name, and slug.
 */
export function OrganizationProfile({ className }: OrganizationProfileProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const { additionalFields, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(authClient)

  const [slug, setSlug] = useState(activeOrganization?.slug ?? "")

  useEffect(() => {
    setSlug(activeOrganization?.slug ?? "")
  }, [activeOrganization?.slug])

  const { mutate: commitOrganizationUpdate, isPending } = useUpdateOrganization(
    authClient,
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
      toast.error(error instanceof Error ? error.message : String(error))
      return
    }

    commitOrganizationUpdate({
      data: { name, slug, ...additionalValues }
    })
  }

  const nameInputId = `${activeOrganization?.id ?? "org"}-name`
  const slugInputId = `${activeOrganization?.id ?? "org"}-slug`

  return (
    <div>
      <h2 className={cn("mb-3 text-sm font-semibold")}>
        {organizationLocalization.organizationProfile}
      </h2>

      <Card className={className}>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ChangeOrganizationLogo />

            <Field>
              <FieldLabel htmlFor={nameInputId}>
                {organizationLocalization.name}
              </FieldLabel>

              {activeOrganization ? (
                <Input
                  key={activeOrganization.id}
                  id={nameInputId}
                  name="name"
                  defaultValue={activeOrganization.name}
                  autoComplete="organization"
                  placeholder={organizationLocalization.namePlaceholder}
                  disabled={isPending}
                />
              ) : (
                <Skeleton className="h-8 w-full rounded-md" />
              )}

              <FieldError />
            </Field>

            {activeOrganization ? (
              <SlugField
                id={slugInputId}
                value={slug}
                onChange={setSlug}
                currentSlug={activeOrganization.slug}
                disabled={isPending}
              />
            ) : (
              <Field>
                <FieldLabel>{organizationLocalization.slug}</FieldLabel>
                <Skeleton className="h-8 w-full rounded-md" />
              </Field>
            )}

            {activeOrganization &&
              additionalFields.map((field) => (
                <AdditionalField
                  key={field.name}
                  field={{
                    ...field,
                    defaultValue: (
                      activeOrganization as Record<string, unknown>
                    )[field.name] as never
                  }}
                  isPending={isPending}
                  name={field.name}
                  optionalLabel={localization.settings.optional}
                />
              ))}

            <Button
              type="submit"
              disabled={isPending || !activeOrganization}
              size="sm"
              className="mt-1 w-fit"
            >
              {isPending && <Spinner />}

              {localization.settings.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
