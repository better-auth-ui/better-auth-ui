"use client"

import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { useEffect } from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"
import { ChangeOrganizationLogo } from "./change-organization-logo"
import { SlugField } from "./slug-field"

export type OrganizationProfileProps = {
  className?: string
  hideSlug?: boolean
}

/**
 * Profile card for the active organization: logo (when enabled), display name, and slug.
 */
export function OrganizationProfile({
  className,
  hideSlug: hideSlugProp
}: OrganizationProfileProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const {
    additionalFields,
    localization: organizationLocalization,
    hideSlug: pluginHideSlug
  } = useAuthPlugin(organizationPlugin)
  const hideSlug = hideSlugProp ?? pluginHideSlug ?? false

  const { data: activeOrganization } = useActiveOrganization(authClient)
  const canUpdate = useHasPermission(authClient, {
    permissions: { organization: ["update"] }
  })

  const { mutateAsync: commitOrganizationUpdate, isPending } =
    useUpdateOrganization(authClient, {
      onSuccess: () =>
        toast.success(organizationLocalization.organizationUpdatedSuccess)
    })

  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(additionalFields),
      name: "",
      slug: ""
    },
    onSubmit: async ({ value }) => {
      if (!activeOrganization || !canUpdate.data?.success) return
      await commitOrganizationUpdate({
        data: {
          ...getAdditionalFieldSubmitValues(
            additionalFields,
            value.additionalFields
          ),
          name: value.name,
          ...(!hideSlug && { slug: value.slug })
        }
      })
    }
  })

  useEffect(() => {
    if (!activeOrganization) return
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(
        fieldsWithModelValues(
          additionalFields,
          activeOrganization as Record<string, unknown>
        )
      ),
      name: activeOrganization.name,
      slug: activeOrganization.slug
    })
  }, [activeOrganization, additionalFields, form])

  const nameInputId = `${activeOrganization?.id ?? "org"}-name`
  const slugInputId = `${activeOrganization?.id ?? "org"}-slug`
  const formDisabled =
    isPending || canUpdate.isPending || !canUpdate.data?.success

  return (
    <div>
      <h2 className={cn("mb-3 text-sm font-semibold")}>
        {organizationLocalization.organizationProfile}
      </h2>

      <Card className={className}>
        <CardContent>
          <form.AppForm>
            <form.AuthFormRoot className="flex flex-col gap-4">
              <ChangeOrganizationLogo />

              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta)

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={nameInputId}>
                        {organizationLocalization.name}
                      </FieldLabel>

                      {activeOrganization ? (
                        <Input
                          id={nameInputId}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          autoComplete="organization"
                          placeholder={organizationLocalization.namePlaceholder}
                          disabled={formDisabled}
                          aria-invalid={isInvalid}
                        />
                      ) : (
                        <Skeleton className="h-8 w-full rounded-md" />
                      )}

                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>

              {!hideSlug &&
                (activeOrganization ? (
                  <form.AppField name="slug">
                    {(field) => (
                      <SlugField
                        id={slugInputId}
                        value={field.state.value}
                        onChange={field.handleChange}
                        currentSlug={activeOrganization.slug}
                        disabled={formDisabled}
                      />
                    )}
                  </form.AppField>
                ) : (
                  <Field>
                    <FieldLabel>{organizationLocalization.slug}</FieldLabel>
                    <Skeleton className="h-8 w-full rounded-md" />
                  </Field>
                ))}

              {activeOrganization &&
                additionalFields.map((configuredField) => (
                  <form.AppField
                    key={configuredField.name}
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={formDisabled}
                        optionalLabel={localization.settings.optional}
                      />
                    )}
                  </form.AppField>
                ))}

              {(canUpdate.isPending || canUpdate.data?.success) && (
                <form.AuthFormSubmitButton
                  disabled={formDisabled || !activeOrganization}
                  size="sm"
                  className="mt-1 w-fit"
                >
                  {localization.settings.saveChanges}
                </form.AuthFormSubmitButton>
              )}
            </form.AuthFormRoot>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
