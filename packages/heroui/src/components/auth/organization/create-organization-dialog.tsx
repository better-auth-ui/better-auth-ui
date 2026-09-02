import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateOrganization } from "@better-auth-ui/react/plugins/organization"
import { Briefcase } from "@gravity-ui/icons"
import { AlertDialog, Button, Input, Label, TextField } from "@heroui/react"
import { useEffect, useRef, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"
import { SlugField, sanitizeSlug } from "./slug-field"

/** Props for the {@link CreateOrganizationDialog} component. */
export type CreateOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  hideSlug?: boolean
}

/**
 * Render a dialog for creating a new organization.
 *
 * @param isOpen - Whether the dialog is open
 * @param onOpenChange - Callback for when the dialog open state changes
 * @returns The create organization dialog as a JSX element
 */
export function CreateOrganizationDialog({
  isOpen,
  onOpenChange,
  hideSlug: hideSlugProp
}: CreateOrganizationDialogProps) {
  const { authClient, localization } = useAuth()
  const {
    additionalFields,
    localization: organizationLocalization,
    hideSlug: pluginHideSlug
  } = useAuthPlugin(organizationPlugin)
  const hideSlug = hideSlugProp ?? pluginHideSlug ?? false

  const [slugEdited, setSlugEdited] = useState(false)
  const submissionGeneration = useRef(0)
  const submissionAttemptGeneration = useRef(0)

  const { mutateAsync: createOrganization, isPending } = useCreateOrganization(
    authClient as OrganizationAuthClient
  )

  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(additionalFields),
      name: "",
      slug: ""
    },
    onSubmit: async ({ value }) => {
      const generation = submissionAttemptGeneration.current
      if (generation !== submissionGeneration.current) return

      try {
        await createOrganization({
          ...getAdditionalFieldSubmitValues(
            additionalFields,
            value.additionalFields
          ),
          name: value.name,
          slug: hideSlug ? undefined : value.slug
        })
        if (generation === submissionGeneration.current) onOpenChange(false)
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  })

  useEffect(() => {
    if (!isOpen) {
      submissionGeneration.current += 1
      form.reset()
      setSlugEdited(false)
    }
  }, [form, isOpen])

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <form.AppForm>
            <form.AuthFormRoot
              onBeforeSubmit={() => {
                submissionAttemptGeneration.current =
                  submissionGeneration.current
              }}
            >
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status="default">
                  <Briefcase />
                </AlertDialog.Icon>

                <AlertDialog.Heading>
                  {organizationLocalization.createOrganization}
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
                <p className="text-muted text-sm">
                  {organizationLocalization.organizationsDescription}
                </p>

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
                        id="name"
                        name={field.name}
                        isDisabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(value) => {
                          field.handleChange(value)
                          if (!slugEdited) {
                            form.setFieldValue("slug", sanitizeSlug(value))
                          }
                        }}
                        isInvalid={isInvalid || undefined}
                        validationBehavior="aria"
                      >
                        <Label>{organizationLocalization.name}</Label>

                        <Input
                          autoFocus
                          placeholder={organizationLocalization.namePlaceholder}
                          variant="secondary"
                        />

                        <field.AuthFormFieldError />
                      </TextField>
                    )
                  }}
                </form.AppField>

                {!hideSlug && (
                  <form.AppField name="slug">
                    {(field) => (
                      <SlugField
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value)
                          setSlugEdited(true)
                        }}
                        isDisabled={isPending}
                        variant="secondary"
                      />
                    )}
                  </form.AppField>
                )}
                {additionalFields.map((configuredField) => (
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
                        isPending={isPending}
                        optionalLabel={localization.settings.optional}
                      />
                    )}
                  </form.AppField>
                ))}
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isPending}>
                  {localization.settings.cancel}
                </Button>

                <form.AuthFormSubmitButton>
                  {organizationLocalization.createOrganization}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
