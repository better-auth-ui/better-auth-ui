import {
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrors,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useCreateOrganization } from "@better-auth-ui/solid/plugins/organization"
import { BriefcaseBusiness } from "lucide-solid"
import { createEffect, createSignal, For, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  createAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "../auth-form"
import { SlugField, sanitizeSlug } from "./slug-field"

export type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hideSlug?: boolean
}

export function CreateOrganizationDialog(props: CreateOrganizationDialogProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const hideSlug = () => props.hideSlug ?? config.hideSlug ?? false
  const [slugEdited, setSlugEdited] = createSignal(false)
  let submissionGeneration = 0
  let submissionAttemptGeneration = 0
  const createOrganization = useCreateOrganization(auth.authClient)
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(
        config.additionalFields
      ),
      name: "",
      slug: ""
    },
    onSubmit: async ({ value }) => {
      const generation = submissionAttemptGeneration
      if (generation !== submissionGeneration) return
      try {
        await createOrganization.mutateAsync({
          ...getAdditionalFieldSubmitValues(
            config.additionalFields,
            value.additionalFields
          ),
          name: value.name,
          slug: hideSlug() ? undefined : value.slug
        })
        if (generation === submissionGeneration) props.onOpenChange(false)
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  }))
  createEffect(() => {
    if (!props.open) {
      submissionGeneration += 1
      form.reset()
      setSlugEdited(false)
    }
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot
            class="flex flex-col gap-6"
            onBeforeSubmit={() => {
              submissionAttemptGeneration = submissionGeneration
            }}
          >
            <DialogHeader>
              <div class="flex size-10 items-center justify-center rounded-md bg-muted">
                <BriefcaseBusiness class="size-4.5" />
              </div>
              <DialogTitle>
                {config.localization.createOrganization}
              </DialogTitle>
              <DialogDescription>
                {config.localization.organizationsDescription}
              </DialogDescription>
            </DialogHeader>

            <form.AppField
              name="name"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: auth.localization.auth.fieldRequired,
                    trim: true
                  })
              }}
            >
              {(field) => {
                const isInvalid = () =>
                  isAuthFormFieldInvalid(field().state.meta)

                return (
                  <Field data-invalid={isInvalid()}>
                    <FieldLabel for="create-organization-name">
                      {config.localization.name}
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid()}
                      autofocus
                      disabled={createOrganization.isPending}
                      id="create-organization-name"
                      name={field().name}
                      onBlur={field().handleBlur}
                      onInput={(event) => {
                        const value = event.currentTarget.value
                        field().handleChange(value)
                        if (!slugEdited()) {
                          form.setFieldValue("slug", sanitizeSlug(value))
                        }
                      }}
                      placeholder={config.localization.namePlaceholder}
                      value={field().state.value}
                    />
                    <FieldError
                      errors={getFormFieldErrors(field().state.meta.errors)}
                    />
                  </Field>
                )
              }}
            </form.AppField>

            <Show when={!hideSlug()}>
              <form.AppField name="slug">
                {(field) => (
                  <SlugField
                    disabled={createOrganization.isPending}
                    id="create-organization-slug"
                    onChange={(value) => {
                      field().handleChange(value)
                      setSlugEdited(true)
                    }}
                    value={field().state.value}
                  />
                )}
              </form.AppField>
            </Show>

            <For each={config.additionalFields}>
              {(configuredField) => (
                <form.AppField
                  name={`additionalFields.${configuredField.name}`}
                  validators={getAuthAdditionalFieldValidators(
                    configuredField,
                    auth.localization.auth.fieldRequired
                  )}
                >
                  {(field) => (
                    <field.AuthFormAdditionalField
                      field={configuredField}
                      isPending={createOrganization.isPending}
                      optionalLabel={auth.localization.settings.optional}
                    />
                  )}
                </form.AppField>
              )}
            </For>

            <DialogFooter>
              <DialogClose
                as={Button}
                disabled={createOrganization.isPending}
                type="button"
                variant="outline"
              >
                {auth.localization.settings.cancel}
              </DialogClose>
              <form.AuthFormSubmitButton>
                {config.localization.createOrganization}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
