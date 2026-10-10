import {
  SlugField,
  sanitizeOrganizationSlug,
  getSlugAvailabilityValidator
} from "./slug-field"
import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type {
  OrganizationAuthClient,
  CreateOrganizationParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCreateOrganization,
  useListOrganizations
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Description } from "../../../primitives/description"
import {
  getAuthAdditionalFieldValidators,
  useAuthForm,
  isAuthFormFieldInvalid
} from "../auth-form"

export type CreateOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  hideSlug?: boolean
}
export function CreateOrganizationDialog({
  isOpen,
  onOpenChange,
  hideSlug
}: CreateOrganizationDialogProps) {
  return isOpen ? (
    <CreateOrganizationForm
      hideSlug={hideSlug}
      onClose={() => onOpenChange(false)}
    />
  ) : null
}
function CreateOrganizationForm({
  hideSlug: hideSlugProp,
  onClose
}: {
  hideSlug?: boolean
  onClose: () => void
}) {
  const { authClient, localization: common } = useAuth()
  const {
    localization,
    additionalFields,
    hideSlug: configuredHideSlug,
    organizationLimit,
    allowOrganizationCreation,
    checkSlug
  } = useAuthPlugin(organizationPlugin)
  const organizations = useListOrganizations(
    authClient as OrganizationAuthClient
  )
  const create = useCreateOrganization(authClient as OrganizationAuthClient)
  const [editedSlug, setEditedSlug] = useState(false)
  const hideSlug = hideSlugProp ?? configuredHideSlug
  const atLimit =
    organizationLimit !== undefined &&
    (organizations.data?.length ?? 0) >= organizationLimit
  const form = useAuthForm({
    defaultValues: {
      name: "",
      slug: "",
      additionalFields: getAdditionalFieldDefaultValues(additionalFields)
    },
    onSubmit: async ({ value }) => {
      if (!allowOrganizationCreation || atLimit)
        throw new Error(localization.organizationLimitReached)
      await create.mutateAsync({
        ...getAdditionalFieldSubmitValues(
          additionalFields,
          value.additionalFields
        ),
        name: value.name.trim(),
        slug: hideSlug ? undefined : value.slug
      } as CreateOrganizationParams)
      onClose()
    }
  })
  const required = (value: string) =>
    validateStringLength(value, {
      trim: true,
      requiredMessage: common.auth.fieldRequired
    })
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !create.isPending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>
          {localization.createOrganization}
        </AlertDialog.Heading>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <form.AppField
              name="name"
              validators={{ onChange: ({ value }) => required(value) }}
              listeners={{
                onChange: ({ value }) => {
                  if (!editedSlug)
                    form.setFieldValue("slug", sanitizeOrganizationSlug(value))
                }
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={localization.name}
                  isDisabled={create.isPending}
                />
              )}
            </form.AppField>
            {!hideSlug ? (
              <form.AppField
                name="slug"
                validators={{
                  onChange: ({ value }) => required(value),
                  onChangeAsync: getSlugAvailabilityValidator(
                    authClient as OrganizationAuthClient,
                    checkSlug
                  ),
                  onChangeAsyncDebounceMs: 500
                }}
              >
                {(field) => (
                  <SlugField
                    value={field.state.value}
                    onChange={(value) => {
                      setEditedSlug(true)
                      field.handleChange(value)
                    }}
                    onBlur={field.handleBlur}
                    error={
                      isAuthFormFieldInvalid(field.state.meta)
                        ? getFormFieldErrorMessage(field.state.meta.errors)
                        : undefined
                    }
                    isDisabled={create.isPending}
                  />
                )}
              </form.AppField>
            ) : null}
            {additionalFields.map((configured) => (
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
                    isPending={create.isPending}
                  />
                )}
              </form.AppField>
            ))}
            {atLimit ? (
              <Description>{localization.organizationLimitReached}</Description>
            ) : null}
            <AlertDialog.Footer>
              <Button isDisabled={create.isPending} onPress={onClose}>
                {common.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton
                isPending={create.isPending}
                isDisabled={
                  !allowOrganizationCreation ||
                  atLimit ||
                  (organizationLimit !== undefined && organizations.isPending)
                }
              >
                {localization.createOrganization}
              </form.AuthFormSubmitButton>
            </AlertDialog.Footer>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialog.Body>
    </AlertDialog>
  )
}
