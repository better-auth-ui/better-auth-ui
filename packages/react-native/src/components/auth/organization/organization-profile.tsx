import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrorMessage,
  validateStringLength
} from "@better-auth-ui/core"
import type {
  OrganizationAuthClient,
  UpdateOrganizationParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useUpdateOrganization
} from "@better-auth-ui/react/plugins/organization"
import { useEffect, useMemo } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import {
  useAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "../auth-form"
import { ChangeOrganizationLogo } from "./change-organization-logo"
import { SlugField, getSlugAvailabilityValidator } from "./slug-field"

export type OrganizationProfileProps = SettingsViewProps
export function OrganizationProfile(props: OrganizationProfileProps) {
  const { authClient, localization: common } = useAuth()
  const { localization, additionalFields, hideSlug, checkSlug } =
    useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const organization = useActiveOrganization(client)
  const permission = useHasPermission(client, {
    organizationId: organization.data?.id,
    permissions: { organization: ["update"] }
  })
  const update = useUpdateOrganization(client)
  const navigation = useAuthNavigation()
  const fields = useMemo(
    () => fieldsWithModelValues(additionalFields, organization.data ?? {}),
    [additionalFields, organization.data]
  )
  const form = useAuthForm({
    defaultValues: {
      name: "",
      slug: "",
      additionalFields: getAdditionalFieldDefaultValues(fields)
    },
    onSubmit: async ({ value }) => {
      if (!organization.data || !permission.data?.success) return
      await update.mutateAsync({
        organizationId: organization.data.id,
        data: {
          ...getAdditionalFieldSubmitValues(fields, value.additionalFields),
          name: value.name.trim(),
          ...(!hideSlug && { slug: value.slug.trim() })
        }
      } as UpdateOrganizationParams)
      toast.success(localization.organizationUpdatedSuccess)
      if (!hideSlug && value.slug.trim() !== organization.data.slug)
        navigation.push(
          {
            section: "organization",
            view: "settings",
            slug: value.slug.trim()
          },
          { replace: true }
        )
    }
  })
  useEffect(() => {
    if (organization.data)
      form.reset({
        name: organization.data.name,
        slug: organization.data.slug,
        additionalFields: getAdditionalFieldDefaultValues(fields)
      })
  }, [form, fields, organization.data])
  const disabled =
    !organization.data || !permission.data?.success || update.isPending
  return (
    <Box className={props.className ?? "gap-3"}>
      <Txt className="font-semibold">{localization.organizationProfile}</Txt>
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          <ChangeOrganizationLogo />
          {organization.error ? (
            <Txt accessibilityRole="alert">{organization.error.message}</Txt>
          ) : null}
          <form.AppForm>
            <form.AuthFormRoot className="gap-4">
              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: common.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => (
                  <>
                    <field.AuthFormTextField
                      label={localization.name}
                      isDisabled={disabled}
                    />
                    {organization.isPending ? (
                      <Skeleton className="h-4 w-full" />
                    ) : null}
                  </>
                )}
              </form.AppField>
              {!hideSlug ? (
                <form.AppField
                  name="slug"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: common.auth.fieldRequired,
                        trim: true
                      }),
                    onChangeAsync: getSlugAvailabilityValidator(
                      client,
                      checkSlug,
                      organization.data?.slug
                    ),
                    onChangeAsyncDebounceMs: 500
                  }}
                >
                  {(field) => (
                    <SlugField
                      value={field.state.value}
                      onChange={field.handleChange}
                      onBlur={field.handleBlur}
                      error={
                        isAuthFormFieldInvalid(field.state.meta)
                          ? getFormFieldErrorMessage(field.state.meta.errors)
                          : undefined
                      }
                      isDisabled={disabled}
                    />
                  )}
                </form.AppField>
              ) : null}
              {fields.map((configured) => (
                <form.AppField
                  key={configured.name}
                  name={`additionalFields.${configured.name}`}
                  validators={getAuthAdditionalFieldValidators(
                    configured,
                    common.auth.fieldRequired
                  )}
                >
                  {(field) => (
                    <field.AuthFormAdditionalField
                      field={configured}
                      isPending={disabled}
                    />
                  )}
                </form.AppField>
              ))}
              <form.AuthFormSubmitButton
                isPending={update.isPending}
                isDisabled={disabled}
              >
                {common.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </form.AuthFormRoot>
          </form.AppForm>
          {!permission.isPending &&
          organization.data &&
          !permission.data?.success ? (
            <Description>{common.errors.permissionDenied}</Description>
          ) : null}
        </Card.Content>
      </Card>
    </Box>
  )
}
