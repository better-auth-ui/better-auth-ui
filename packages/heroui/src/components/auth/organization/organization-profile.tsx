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
import {
  Card,
  type CardProps,
  cn,
  Input,
  Label,
  Skeleton,
  TextField,
  toast
} from "@heroui/react"
import { useEffect } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
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
  variant?: CardProps["variant"]
}

/**
 * Profile card for the active organization: logo (when enabled), display name, and slug.
 */
export function OrganizationProfile({
  className,
  variant,
  hideSlug: hideSlugProp,
  ...props
}: OrganizationProfileProps & Omit<CardProps, "children">) {
  const { authClient, localization } = useAuth()
  const {
    additionalFields,
    localization: organizationLocalization,
    hideSlug: pluginHideSlug
  } = useAuthPlugin(organizationPlugin)
  const hideSlug = hideSlugProp ?? pluginHideSlug ?? false

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )
  const canUpdate = useHasPermission(authClient as OrganizationAuthClient, {
    permissions: { organization: ["update"] }
  })

  const { mutateAsync: commitOrganizationUpdate, isPending } =
    useUpdateOrganization(authClient as OrganizationAuthClient, {
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

  const inputVariant = variant === "transparent" ? "primary" : "secondary"
  const formDisabled =
    isPending || canUpdate.isPending || !canUpdate.data?.success

  return (
    <div>
      <h2 className={cn("mb-3 text-sm font-semibold")}>
        {organizationLocalization.organizationProfile}
      </h2>

      <Card className={cn(className)} variant={variant} {...props}>
        <Card.Content>
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
                    <TextField
                      name={field.name}
                      isDisabled={formDisabled || !activeOrganization}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      isInvalid={isInvalid || undefined}
                      validationBehavior="aria"
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

                      <field.AuthFormFieldError />
                    </TextField>
                  )
                }}
              </form.AppField>

              {!hideSlug &&
                (activeOrganization ? (
                  <form.AppField name="slug">
                    {(field) => (
                      <SlugField
                        value={field.state.value}
                        onChange={field.handleChange}
                        currentSlug={activeOrganization.slug}
                        isDisabled={formDisabled}
                        variant={inputVariant}
                      />
                    )}
                  </form.AppField>
                ) : (
                  <TextField isDisabled>
                    <Label>{organizationLocalization.slug}</Label>
                    <Skeleton className="h-10 w-full rounded-xl md:h-9" />
                  </TextField>
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
                        variant={variant}
                      />
                    )}
                  </form.AppField>
                ))}

              {(canUpdate.isPending || canUpdate.data?.success) && (
                <form.AuthFormSubmitButton
                  isDisabled={formDisabled || !activeOrganization}
                  size="sm"
                  className="mt-1"
                >
                  {localization.settings.saveChanges}
                </form.AuthFormSubmitButton>
              )}
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </div>
  )
}
