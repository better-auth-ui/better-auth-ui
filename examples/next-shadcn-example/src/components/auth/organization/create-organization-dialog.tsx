"use client"

import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateOrganization } from "@better-auth-ui/react/plugins/organization"
import { Briefcase } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"
import { SlugField, sanitizeSlug } from "./slug-field"

/** Props for the `CreateOrganizationDialog` component. */
export type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hideSlug?: boolean
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  hideSlug: hideSlugProp
}: CreateOrganizationDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const {
    additionalFields,
    localization: organizationLocalization,
    hideSlug: pluginHideSlug
  } = useAuthPlugin(organizationPlugin)
  const hideSlug = hideSlugProp ?? pluginHideSlug ?? false

  const [slugEdited, setSlugEdited] = useState(false)
  const submissionGeneration = useRef(0)
  const submissionAttemptGeneration = useRef(0)

  const { mutateAsync: createOrganization } = useCreateOrganization(authClient)

  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(additionalFields),
      name: "",
      slug: ""
    },
    onSubmit: async ({ value }) => {
      const generation = submissionAttemptGeneration.current
      if (generation !== submissionGeneration.current) return
      await createOrganization({
        ...getAdditionalFieldSubmitValues(
          additionalFields,
          value.additionalFields
        ),
        name: value.name,
        slug: hideSlug ? undefined : value.slug
      })
      if (generation === submissionGeneration.current) onOpenChange(false)
    }
  })

  useEffect(() => {
    if (!open) {
      submissionGeneration.current += 1
      form.reset()
      setSlugEdited(false)
    }
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot
            className="flex flex-col gap-6"
            onBeforeSubmit={() => {
              submissionAttemptGeneration.current = submissionGeneration.current
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase />
                {organizationLocalization.createOrganization}
              </DialogTitle>

              <DialogDescription>
                {organizationLocalization.organizationsDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
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
                      <FieldLabel htmlFor="create-organization-name">
                        {organizationLocalization.name}
                      </FieldLabel>

                      <Input
                        id="create-organization-name"
                        name={field.name}
                        autoFocus
                        placeholder={organizationLocalization.namePlaceholder}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const value = event.target.value
                          field.handleChange(value)
                          if (!slugEdited) {
                            form.setFieldValue("slug", sanitizeSlug(value))
                          }
                        }}
                        aria-invalid={isInvalid}
                      />

                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>

              {!hideSlug && (
                <form.AppField name="slug">
                  {(field) => (
                    <SlugField
                      id="create-organization-slug"
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value)
                        setSlugEdited(true)
                      }}
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
                      optionalLabel={localization.settings.optional}
                    />
                  )}
                </form.AppField>
              ))}
            </div>

            <DialogFooter>
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>

              <form.AuthFormSubmitButton>
                {organizationLocalization.createOrganization}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
